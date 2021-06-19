using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Storage.models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public class AzureFileStorage : IFilesStorage
    {
        private readonly BlobServiceClient blobServiceClient;

        private Dictionary<ContentTypesFile, string> folders;

        public AzureFileStorage(BlobServiceClient blobServiceClient)
        {
            this.blobServiceClient = blobServiceClient;

            folders = new Dictionary<ContentTypesFile, string>()
            {
                {  ContentTypesFile.Images, "Images" },
                {  ContentTypesFile.Videos, "Videos" },
                {  ContentTypesFile.Files,  "Files"  },
                {  ContentTypesFile.Audios, "Audios" },
            };
        }


        public void Dispose()
        {

        }

        public async Task<GetFileResponse> GetFile(string userId, string path)
        {
            var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
            BlobClient blobClient = blobContainer.GetBlobClient(path);
            if (await blobClient.ExistsAsync())
            {
                using var ms = new MemoryStream();
                await blobClient.DownloadToAsync(ms);
                return new GetFileResponse
                {
                    File = ms.ToArray(),
                    ContentType = blobClient.GetProperties().Value.ContentType
                };
            }
            else
            {
                throw new Exception("File does not exist");
            }
        }

        public async Task RemoveFile(string userId, string path)
        {
           var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
           await blobContainer.DeleteBlobAsync(path);
        }

        public async Task RemoveFiles(string userId, params string[] pathes)
        {
            foreach(var path in pathes)
            {
                if(!string.IsNullOrEmpty(path))
                {
                    var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
                    await blobContainer.DeleteBlobAsync(path);
                }
            }
        }


        private BlobHttpHeaders GetBlobHttpHeaders(string contentType)
        {
            var headers = new BlobHttpHeaders();
            headers.ContentType = contentType;
            return headers;
        }


        public async Task<string> SaveFile(string userId, byte[] file, string contentType, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
            var path = PathFactory(contentFolder, fileTypeEnd);
            var blobClient = blobContainer.GetBlobClient(path);

            var stream = new MemoryStream(file);
            stream.Position = 0;

            var headers = GetBlobHttpHeaders(contentType);

            var resp = await blobClient.UploadAsync(stream, headers);

            await stream.DisposeAsync();
            return blobClient.Name;
        }

        public async Task<long> GetUsedDiskSpace(string userId)
        {
            var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
            var files = blobContainer.GetBlobsByHierarchyAsync();
            long length = 0;
            await foreach(var file in files)
            {
                length += file.Blob.Properties.ContentLength.Value;
            }
            return length;
        }


        public string PathFactory(ContentTypesFile type, string fileTypeEnd)
        {
            return folders.GetValueOrDefault(type) + "/" + Guid.NewGuid() + "-" + Guid.NewGuid() + "-" + Guid.NewGuid() + fileTypeEnd;
        }

        public async Task CreateUserContainer(Guid userId)
        {
            var container = await blobServiceClient.CreateBlobContainerAsync(userId.ToString(), PublicAccessType.Blob);
        }
    }
}
