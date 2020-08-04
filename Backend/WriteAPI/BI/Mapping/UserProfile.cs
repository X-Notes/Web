using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.users;
using Domain.Commands.users;

namespace BI.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, ShortUser>();
            CreateMap<NewUserCommand, User>();
            CreateMap<NewUser, NewUserCommand>();

            CreateMap<User, OnlineUserOnNote>();
        }
    }
}
