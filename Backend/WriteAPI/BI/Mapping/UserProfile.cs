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
            CreateMap<UserOnPrivateNotes, InvitedUsersToNote>()
                .ForMember(p => p.Id, dest => dest.MapFrom(d => d.UserId))
                .ForMember(p => p.Name, dest => dest.MapFrom(d => d.User.Name))
                .ForMember(p => p.PhotoId, dest => dest.MapFrom(d => d.User.PhotoId))
                .ForMember(p => p.Email, dest => dest.MapFrom(d => d.User.Email))
                .ForMember(p => p.AccessType, dest => dest.MapFrom(d => d.AccessType));
        }
    }
}
