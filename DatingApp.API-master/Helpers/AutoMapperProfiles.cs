using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            // map data for output from the server
            CreateMap<User, UserForListDto>()
            .ForMember(dest => dest.Age, options => options.MapFrom(src => src.DateOfBirth.CalculateAge()))
            .ForMember(dest => dest.MainPhotoUrl, options =>
            options.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain == true).Url));

            CreateMap<User, UserForDetailedDto>()
            .ForMember(dest => dest.Age, options => options.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<Photo, PhotoForListDto>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<Message, MessageForReturnDto>()
            .ForMember(m => m.RecipientPhotoUrl,
            options => options.MapFrom(src => src.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(m => m.SenderPhotoUrl,
            options => options.MapFrom(src => src.Sender.Photos.FirstOrDefault(p => p.IsMain).Url));

            // map data for input to the server
            CreateMap<UserForUpdateDto, User>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
        }
    }
}