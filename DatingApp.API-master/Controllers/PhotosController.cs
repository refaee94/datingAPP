using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;
        private Cloudinary cloudinary;

        public PhotosController(IDatingRepository datingRepository,
        IOptions<CloudinarySettings> cloudinaryConfig,
        IMapper mapper)
        {
            this.cloudinaryConfig = cloudinaryConfig;
            this.mapper = mapper;
            this.datingRepository = datingRepository;

            Account account = new Account(
                this.cloudinaryConfig.Value.CloudName,
                this.cloudinaryConfig.Value.ApiKey,
                this.cloudinaryConfig.Value.ApiSecret
            );

            this.cloudinary = new Cloudinary(account);

        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photo = await this.datingRepository.GetPhotoAsync(id);

            var photoToReturn = this.mapper.Map<PhotoForReturnDto>(photo);
            return Ok(photoToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, PhotoForCreationDto photoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userFromRepo = await this.datingRepository.GetUserAsync(userId);
            if (userFromRepo == null)
                return NotFound($"Could not find user with ID of {userId}");

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            if (currentUserId != userId)
                return Unauthorized();

            var file = photoDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length != 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = this.cloudinary.Upload(uploadParams);
                }
            }
            var photo = mapper.Map<Photo>(photoDto);
            photo.PublicId = uploadResult.PublicId;
            photo.Url = uploadResult.Uri.ToString();
            photo.User = userFromRepo;
            userFromRepo.Photos.Add(photo);


            if (!userFromRepo.Photos.Any(p => p.IsMain))
                photo.IsMain = true;

            if (await this.datingRepository.SaveAll())
            {
                var photoToReturn = this.mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }

        [Route("{id}/setMain")]
        [HttpPost]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var photo = await this.datingRepository.GetPhotoAsync(id);
            if (photo == null)
                return NotFound($"Could not find photo with ID of {id}");

            if (photo.IsMain)
                return BadRequest("this is already the main photo");

            var currentMainPhoto = await this.datingRepository.GetMainPhotoForUserAsnyc(userId);

            if (currentMainPhoto != null)
                currentMainPhoto.IsMain = false;

            photo.IsMain = true;

            if (await this.datingRepository.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int userId, int id)
        {

            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var photo = await this.datingRepository.GetPhotoAsync(id);
            if (photo == null)
                return NotFound($"Could not find photo with ID of {id}");

            if (photo.IsMain)
                return BadRequest("you can't remove the main photo");

            if (photo.PublicId != null)
            {
                var deletionParams = new DeletionParams(photo.PublicId);
                var result = this.cloudinary.Destroy(deletionParams);
                if(result.Result == "ok"){
                    this.datingRepository.Delete(photo);
                }
            }
            else
            {
                this.datingRepository.Delete(photo);
            }

            if(await this.datingRepository.SaveAll()){
                return Ok();
            }

            return BadRequest("Failed to delete the photo");
        }
    }
}