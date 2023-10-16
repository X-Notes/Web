using Common.DatabaseModels.Models.Files.Models;
using Noots.Storage.Entities;

namespace Noots.Storage.Interfaces
{
    public interface IFilesStorage : IDisposable
    {
        Task<UploadFileResult> SaveFile(StoragesEnum storageId, string userId, byte[] file, string ContentType, string prefixFolder, string contentId, string fileName);
        Task<bool> RemoveFile(StoragesEnum storageId, string userId, string path);
        Task RemoveFiles(StoragesEnum storageId, string userId, params string[] pathes);
        Task<GetFileResponse> GetFile(StoragesEnum storageId, string userId, string path);
        Task<long> GetUsedDiskSpace(StoragesEnum storageId, string userId);
        Task<(bool success, string path)> CopyBlobAsync(StoragesEnum storageFromId, string userFromId, string path, StoragesEnum storageToId, string userToId, string prefixFolder, string contentId, string fileName);
    }
}