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
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.Email, dest => dest.MapFrom(d => d.Email))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.PhotoId))
                .ForMember(x => x.CurrentBackground, dest => dest.MapFrom(d => d.CurrentBackground))
                .ForMember(x => x.Language, dest => dest.MapFrom(d => d.Language))
                .ForMember(x => x.Theme, dest => dest.MapFrom(d => d.Theme))
                .ForMember(x => x.FontSize, dest => dest.MapFrom(d => d.FontSize));

            CreateMap<User, OnlineUserOnNote>()
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.PhotoId));


            CreateMap<User, ShortUserForShareModal>()
                .ForMember(x => x.Id, dest => dest.MapFrom(d => d.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.PhotoId))
                .ForMember(x => x.Email, dest => dest.MapFrom(d => d.Email));

            CreateMap<UsersOnPrivateFolders, InvitedUsersToFoldersOrNote>()
                .ForMember(p => p.Id, dest => dest.MapFrom(d => d.UserId))
                .ForMember(p => p.Name, dest => dest.MapFrom(d => d.User.Name))
                .ForMember(p => p.PhotoId, dest => dest.MapFrom(d => d.User.PhotoId))
                .ForMember(p => p.Email, dest => dest.MapFrom(d => d.User.Email))
                .ForMember(p => p.AccessTypeId, dest => dest.MapFrom(d => d.AccessTypeId))
                .ForMember(p => p.AccessType, dest => dest.MapFrom(d => d.AccessType));


            CreateMap<UserOnPrivateNotes, InvitedUsersToFoldersOrNote>()
                .ForMember(p => p.Id, dest => dest.MapFrom(d => d.UserId))
                .ForMember(p => p.Name, dest => dest.MapFrom(d => d.User.Name))
                .ForMember(p => p.PhotoId, dest => dest.MapFrom(d => d.User.PhotoId))
                .ForMember(p => p.Email, dest => dest.MapFrom(d => d.User.Email))
                .ForMember(p => p.AccessTypeId, dest => dest.MapFrom(d => d.AccessTypeId))
                .ForMember(p => p.AccessType, dest => dest.MapFrom(d => d.AccessType));
        }
    }
}
