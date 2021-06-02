using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Storage.models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public interface IFilesStorage : IDisposable
    {
        public Task CreateUserContainer(Guid userId);
        Task<string> SaveFile(string userId, IFormFile file, ContentTypesFile contentFolder, string fileTypeEnd);
        Task<string> SaveFile(string userId, byte[] file, string ContentType, ContentTypesFile contentFolder, string fileTypeEnd);
        Task RemoveFile(string userId, string path);
        Task<GetFileResponse> GetFile(string userId, string path);
    }
}
