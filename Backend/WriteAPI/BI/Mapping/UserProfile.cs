using AutoMapper;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Search;
using Common.DTO.Users;

namespace BI.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, ShortUser>()
                .ForMember(x => x.Id, dest => dest.MapFrom(d => d.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.Email, dest => dest.MapFrom(d => d.Email))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFile.GetFromBigPath))
                .ForMember(x => x.CurrentBackground, dest => dest.MapFrom(d => d.CurrentBackground))
                .ForMember(x => x.LanguageId, dest => dest.MapFrom(d => d.LanguageId))
                .ForMember(x => x.ThemeId, dest => dest.MapFrom(d => d.ThemeId))
                .ForMember(x => x.FontSizeId, dest => dest.MapFrom(d => d.FontSizeId));

            CreateMap<User, OnlineUserOnNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(d => d.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFile.GetFromSmallPath));


            CreateMap<User, ShortUserForShareModal>()
                .ForMember(x => x.Id, dest => dest.MapFrom(d => d.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(d => d.Name))
                .ForMember(x => x.Email, dest => dest.MapFrom(d => d.Email))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(d => d.UserProfilePhoto.AppFile.GetFromSmallPath));

            CreateMap<UsersOnPrivateFolders, InvitedUsersToFoldersOrNote>()
                .ForMember(p => p.Id, dest => dest.MapFrom(d => d.UserId))
                .ForMember(p => p.Name, dest => dest.MapFrom(d => d.User.Name))
                .ForMember(p => p.Email, dest => dest.MapFrom(d => d.User.Email))
                .ForMember(p => p.AccessTypeId, dest => dest.MapFrom(d => d.AccessTypeId))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.User.UserProfilePhoto.AppFileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(d => d.User.UserProfilePhoto.AppFile.GetFromSmallPath));


            CreateMap<UserOnPrivateNotes, InvitedUsersToFoldersOrNote>()
                .ForMember(p => p.Id, dest => dest.MapFrom(d => d.UserId))
                .ForMember(p => p.Name, dest => dest.MapFrom(d => d.User.Name))
                .ForMember(p => p.Email, dest => dest.MapFrom(d => d.User.Email))
                .ForMember(p => p.AccessTypeId, dest => dest.MapFrom(d => d.AccessTypeId))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(d => d.User.UserProfilePhoto.AppFileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(d => d.User.UserProfilePhoto.AppFile.GetFromSmallPath));
        }
    }
}
