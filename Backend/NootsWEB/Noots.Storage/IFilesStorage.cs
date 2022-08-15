using Noots.Storage.Entities;

namespace Noots.Storage
{
    public interface IFilesStorage : IDisposable
    {
        public Task CreateUserContainer(Guid userId);
        Task<UploadFileResult> SaveFile(string userId, byte[] file, string ContentType, ContentTypesFile contentFolder, string fileTypeEnd);
        Task RemoveFile(string userId, string path);
        Task RemoveFiles(string userId, params string[] pathes);
        Task<GetFileResponse> GetFile(string userId, string path);
        Task<long> GetUsedDiskSpace(string userId);
        Task<string> CopyBlobAsync(string userFromId, string path, string userToId, ContentTypesFile contentFolder, string fileTypeEnd);
    }
}
