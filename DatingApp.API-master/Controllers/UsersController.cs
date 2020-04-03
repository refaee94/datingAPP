using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;

        public UsersController(IDatingRepository datingRepository, IMapper mapper)
        {
            this.datingRepository = datingRepository;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> getUsers(UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await datingRepository.GetUserAsync(currentUserId);

            userParams.UserId = currentUserId;

            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users = await this.datingRepository.GetUsersAsync(userParams);

            var usersList = this.mapper.Map<IEnumerable<UserForListDto>>(users);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(usersList);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> getUser(int id)
        {
            var user = await this.datingRepository.GetUserAsync(id);

            var userDetails = this.mapper.Map<UserForDetailedDto>(user);

            return Ok(userDetails);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> updateUser(int id, [FromBody] UserForUpdateDto userForUpdateDto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await datingRepository.GetUserAsync(id);

            if (userFromRepo == null)
                return NotFound($"Could not find user with ID of {id}");

            if (userFromRepo.Id != id)
                return Unauthorized();

            mapper.Map(userForUpdateDto, userFromRepo);

            if (await datingRepository.SaveAll())
                return NoContent();

            throw new Exception($"Updating user {id} faild on save");
        }

        [HttpPost("{id}/like/{likeeId}")]
        public async Task<IActionResult> LikeUser(int id, int likeeId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            if((await this.datingRepository.GetLike(id, likeeId)) != null){
                return BadRequest("You already like this user");
            }

            if((await this.datingRepository.GetUserAsync(likeeId)) == null)
            {
                return NotFound();
            }

            var like = new Like{
                LikerId = id,
                LikeeId = likeeId
            };

            this.datingRepository.Add<Like>(like);

            if(await this.datingRepository.SaveAll()) {
                return Ok(new {});
            }

            return BadRequest("Failed to add user");
        }


    }
}