using AutoMapper;
using Shared.DTO.User;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.MappingProfiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<DTOUser, User>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.PhotoId, opt => opt.MapFrom(src => src.Photo))
            .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<User, DTOUser>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Photo, opt => opt.MapFrom(src => src.PhotoId));
        }
    }
}
