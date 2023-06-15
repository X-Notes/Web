using Common.Azure;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DatabaseModels.Models.WS;
using Common.DTO.Backgrounds;
using Common.DTO.Users;

namespace Noots.Mapper.Mapping
{
    public class UserBackgroundMapper : BaseMapper
    {

        public UserBackgroundMapper(AzureConfig azureConfig) : base(azureConfig)
        {
        }

        public OnlineUserOnNote MapToOnlineUserOnNote(User user, List<Guid> userIdentifiers)
        {
            return new OnlineUserOnNote
            {
                UserIdentifiers = userIdentifiers,
                UserId = user.Id,
                Name = user.Name,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = GetUserProfilePhotoPath(user)
            };
        }


        public OnlineUserOnNote MapToOnlineUserOnNote(UserIdentifierConnectionId user)
        {
            return new OnlineUserOnNote
            {
                UserIdentifiers = new List<Guid> { user.Id },
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
                PhotoPath = GetUserProfilePhotoPath(user.User),
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
                PhotoPath = GetUserProfilePhotoPath(user.User),
                AccessTypeId = user.AccessTypeId
            };
        }

        public BackgroundDTO MapToBackgroundDTO(Background background)
        {
            return new BackgroundDTO
            {
                Id = background.Id,
                PhotoId = background.FileId,
                PhotoPath = BuildFilePath(background.File.StorageId, background.UserId, background.File.GetFromDefaultPath)
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
    }
}
