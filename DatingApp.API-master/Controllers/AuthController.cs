using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository authRepository;
        private readonly IConfiguration configuration;
        private readonly IMapper mapper;

        public AuthController(IAuthRepository authRepository, IConfiguration configuration, IMapper mapper)
        {
            this.mapper = mapper;
            this.authRepository = authRepository;
            this.configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserForRegisterDto userForRegisterDto)
        {
            // validate request
            if (await this.authRepository.UserExistsAsync(userForRegisterDto.UserName))
                ModelState.AddModelError("UserName", "UserName is alreardy taken");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userToCreate = this.mapper.Map<User>(userForRegisterDto);

            var createdUser = await this.authRepository.Register(user: userToCreate, password: userForRegisterDto.Password);

            return CreatedAtRoute("GetUser",new {controller = "Users", id = createdUser.Id }, createdUser);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserForLoginDto userForLoginDto)
        {
            var userFromRepo = await this.authRepository.Login(userForLoginDto.UserName, userForLoginDto.Password);

            if (userFromRepo == null)
                return Unauthorized();

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(
                this.configuration.GetSection("AppSettings:Token").Value
            );
            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(new Claim[]{
                    new Claim(ClaimTypes.NameIdentifier, userFromRepo.Id.ToString()),
                    new Claim(ClaimTypes.Name, userFromRepo.UserName)
                }),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha512Signature),
                Expires = DateTime.Now.AddDays(1)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var user = this.mapper.Map<UserForDetailedDto>(userFromRepo);
            user.LastActive = DateTime.Now;
            return Ok(new { tokenString, user });
        }
    }
}