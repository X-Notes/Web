using AutoMapper;
using Common.DTO;
using Domain.Commands.users;
using WriteContext.models;

namespace BI.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, ShortUser>();
            CreateMap<NewUser, User>();
        }
    }
}
