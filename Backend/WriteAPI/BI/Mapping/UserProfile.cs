using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.search;
using Common.DTO.users;
using Domain.Commands.users;

namespace BI.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, ShortUser>()
                .ForMember(x => x.FontSize, dest => dest.MapFrom(z => z.PersonalitionSettings.FontSize))
                .ForMember(x => x.Theme, dest => dest.MapFrom(z => z.PersonalitionSettings.Theme));
            CreateMap<NewUserCommand, User>();
            CreateMap<NewUser, NewUserCommand>();

            CreateMap<User, OnlineUserOnNote>();
            CreateMap<User, ShortUserForShareModal>();
        }
    }
}
