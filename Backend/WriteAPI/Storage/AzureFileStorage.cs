using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Storage.Models;
using Azure.Storage.Blobs.Specialized;
using Azure;
using Azure.Storage;
using Microsoft.Extensions.Logging;

namespace Storage
{
    public class AzureFileStorage : IFilesStorage
    {
        private readonly BlobServiceClient blobServiceClient;
        private readonly ILogger<AzureFileStorage> logger;
        private Dictionary<ContentTypesFile, string> folders;

        public AzureFileStorage(BlobServiceClient blobServiceClient, ILogger<AzureFileStorage> logger)
        {
            this.blobServiceClient = blobServiceClient;
            this.logger = logger;
            folders = new Dictionary<ContentTypesFile, string>()
            {
                {  ContentTypesFile.Photos, "Images" },
                {  ContentTypesFile.Videos, "Videos" },
                {  ContentTypesFile.Documents,  "Files"  },
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


        public async Task<UploadFileResult> SaveFile(string userId, byte[] file, string contentType, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            var blobContainer = blobServiceClient.GetBlobContainerClient(userId);
            var path = PathFactory(contentFolder, fileTypeEnd);
            var blobClient = blobContainer.GetBlobClient(path);

            using var stream = new MemoryStream(file);
            stream.Position = 0;

            var headers = GetBlobHttpHeaders(contentType);

            var options = new StorageTransferOptions() // TODO fragile configuration, need to be careful these settings affect performance
            {
                MaximumConcurrency = 4,
                InitialTransferSize = 20971520
            };

            var resp = await blobClient.UploadAsync(stream, headers, transferOptions: options);

            await stream.DisposeAsync();

            return new UploadFileResult {
                FilePath = blobClient.Name,
                StorageFileSize = blobClient.GetProperties().Value.ContentLength,
                UploadedFileSize = file.Length
            };
        }

        public async Task<string> CopyBlobAsync(string userFromId, string path, string userToId, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            try
            {
                var blobContainerFrom = blobServiceClient.GetBlobContainerClient(userFromId);
                var blobContainerTo = blobServiceClient.GetBlobContainerClient(userToId);

                BlobClient sourceBlob = blobContainerFrom.GetBlobClient(path);

                if (await sourceBlob.ExistsAsync())
                {
                    // Lease the source blob for the copy operation 
                    // to prevent another client from modifying it.
                    BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();

                    // Specifying -1 for the lease interval creates an infinite lease.
                    await lease.AcquireAsync(TimeSpan.FromSeconds(-1));

                    // Get the source blob's properties and display the lease state.
                    BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();

                    // Get a BlobClient representing the destination blob with a unique name.
                    BlobClient destBlob = blobContainerTo.GetBlobClient(PathFactory(contentFolder, fileTypeEnd));

                    // Start the copy operation.
                    await destBlob.StartCopyFromUriAsync(sourceBlob.Uri);

                    // Get the destination blob's properties and display the copy status.
                    BlobProperties destProperties = await destBlob.GetPropertiesAsync();

                    // Update the source blob's properties.
                    sourceProperties = await sourceBlob.GetPropertiesAsync();

                    if (sourceProperties.LeaseState == LeaseState.Leased)
                    {
                        // Break the lease on the source blob.
                        await lease.BreakAsync();

                        // Update the source blob's properties to check the lease state.
                        sourceProperties = await sourceBlob.GetPropertiesAsync();
                    }

                    return destBlob.Name;
                }

                throw new Exception("Blob does not exist");
            }
            catch (RequestFailedException ex)
            {
                logger.LogDebug(ex.ToString());
                throw;
            }
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
            if (string.IsNullOrEmpty(fileTypeEnd))
            {
                throw new Exception("Invalid file type end");
            }
            return folders.GetValueOrDefault(type) + "/" + Guid.NewGuid() + "-" + Guid.NewGuid() + "-" + Guid.NewGuid() + fileTypeEnd;
        }

        public async Task CreateUserContainer(Guid userId)
        {
            var container = await blobServiceClient.CreateBlobContainerAsync(userId.ToString(), PublicAccessType.Blob);
        }
    }
}
