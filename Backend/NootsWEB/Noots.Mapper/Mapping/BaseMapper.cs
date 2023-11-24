using Common.Azure;
using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.Users;

namespace Mapper.Mapping
{
    public abstract class BaseMapper
    {
        private readonly AzureConfig azureConfig;

        public BaseMapper(AzureConfig azureConfig)
        {
            this.azureConfig = azureConfig;
        }

        public string BuildFilePath(StoragesEnum storageId, Guid userId, string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }
            return azureConfig.FirstOrDefaultCache(storageId).Url + "/" + userId + "/" + path;
        }

        public string GetUserProfilePhotoPath(User user)
        {
            if (user.UserProfilePhoto == null)
            {
                return user.DefaultPhotoUrl;
            }
            var file = user.UserProfilePhoto.AppFile;
            return BuildFilePath(file.StorageId, user.Id, file.GetFromSmallPath);
        }
    }
}
