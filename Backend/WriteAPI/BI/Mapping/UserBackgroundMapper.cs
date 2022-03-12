using System;
using Common.Azure;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Backgrounds;
using Common.DTO.Search;
using Common.DTO.Users;


namespace BI.Mapping
{
    public class UserBackgroundMapper
    {
        private readonly AzureConfig azureConfig;

        public UserBackgroundMapper(AzureConfig azureConfig)
        {
            this.azureConfig = azureConfig;
        }

        public ShortUser MapToShortUser(User user)
        {
            return new ShortUser
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = user.UserProfilePhoto != null ? BuildPhotoPath(user.Id, user.UserProfilePhoto.AppFile.GetFromBigPath) : user.DefaultPhotoUrl,
                CurrentBackground = user.CurrentBackground != null ? MapToBackgroundDTO(user.CurrentBackground) : null,
                LanguageId = user.LanguageId,
                ThemeId = user.ThemeId,
                FontSizeId = user.FontSizeId,
                BillingPlanId = user.BillingPlanId
            };
        }

        public OnlineUserOnNote MapToOnlineUserOnNote(User user)
        {
            return new OnlineUserOnNote {
                Id = user.Id,
                Name = user.Name,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = user.UserProfilePhoto != null ? BuildPhotoPath(user.Id, user.UserProfilePhoto.AppFile.GetFromSmallPath) : user.DefaultPhotoUrl
            };
        }

        public ShortUserForShareModal MapToShortUserForShareModal(User user)
        {
            return new ShortUserForShareModal
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = user.UserProfilePhoto != null ? BuildPhotoPath(user.Id, user.UserProfilePhoto.AppFile.GetFromSmallPath) : user.DefaultPhotoUrl
            };
        }

        public InvitedUsersToFoldersOrNote MapToInvitedUsersToFoldersOrNote(UserOnPrivateNotes user)
        {
            return new InvitedUsersToFoldersOrNote
            {
                Id = user.UserId,
                Name = user.User.Name,
                Email = user.User.Email,
                PhotoId = user.User.UserProfilePhoto?.AppFileId,
                PhotoPath = user.User.UserProfilePhoto != null ? BuildPhotoPath(user.Id, user.User.UserProfilePhoto.AppFile.GetFromSmallPath) : user.User.DefaultPhotoUrl,
                AccessTypeId = user.AccessTypeId
            };
        }

        public InvitedUsersToFoldersOrNote MapToInvitedUsersToFoldersOrNote(UsersOnPrivateFolders user)
        {
            return new InvitedUsersToFoldersOrNote
            {
                Id = user.UserId,
                Name = user.User.Name,
                Email = user.User.Email,
                PhotoId = user.User.UserProfilePhoto?.AppFileId,
                PhotoPath = user.User.UserProfilePhoto != null ? BuildPhotoPath(user.Id, user.User.UserProfilePhoto.AppFile.GetFromSmallPath) : user.User.DefaultPhotoUrl,
                AccessTypeId = user.AccessTypeId
            };
        }

        public BackgroundDTO MapToBackgroundDTO(Background background)
        {
            return new BackgroundDTO
            {
                Id = background.Id,
                PhotoId = background.FileId,
                PhotoPath = BuildPhotoPath(background.UserId, background.File.GetFromBigPath)
            };
        }

        public Background MapToBackground(BackgroundDTO background)
        {
            return new Background
            {
                Id = background.Id,
                FileId = background.PhotoId
            };
        }

        public string BuildPhotoPath(Guid userId, string path)
        {
            return this.azureConfig.StorageEmulatorUrl + "/" + userId + "/" + path;
        }
    }
}
