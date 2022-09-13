using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure;
using Azure.Storage;
using Microsoft.Extensions.Logging;
using Noots.Storage.Entities;
using Noots.Storage.Interfaces;
using Common.DatabaseModels.Models.Files.Models;
using Common.Azure;

namespace Noots.Storage.Impl.AzureStorage
{
    public class AzureFileStorage : IFilesStorage
    {
        private readonly ILogger<AzureFileStorage> logger;

        private readonly AzureConfig azureConfig;

        public AzureFileStorage(
            ILogger<AzureFileStorage> logger,
            AzureConfig azureConfig)
        {
            this.logger = logger;
            this.azureConfig = azureConfig;
        }

        public void Dispose()
        {

        }

        private BlobServiceClient GetBlobServiceClient(StoragesEnum storageId)
        {
            var storage = azureConfig.FirstOrDefaultCache(storageId);
            if(storage == null)
            {
                throw new NullReferenceException("Storage null");
            }
            return new BlobServiceClient(storage.Connection);
        }

        private BlobContainerClient GetBlobContainerClient(StoragesEnum storageId, string userId)
        {
            var service = GetBlobServiceClient(storageId);
            return service.GetBlobContainerClient(userId);
        }

        private BlobClient GetBlobClient(StoragesEnum storageId, string userId, string path)
        {
            var blobContainerClient = GetBlobContainerClient(storageId, userId);
            return blobContainerClient.GetBlobClient(path);
        }


        public async Task<GetFileResponse> GetFile(StoragesEnum storageId, string userId, string path)
        {
            var blobClient = GetBlobClient(storageId, userId, path);
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

        public async Task RemoveFile(StoragesEnum storageId, string userId, string path)
        {
            var blobContainer = GetBlobContainerClient(storageId, userId);
            var containerExist = await blobContainer.ExistsAsync();

            if (!containerExist)
            {
                logger.LogCritical($"RemoveFile, CONTAINER does not exist, storageId: {storageId}, userId: {userId}, path: {path}");
                return;
            }

            var blob = blobContainer.GetBlobClient(path);
            var blobExist = blob.Exists();

            if (!blobExist)
            {
                logger.LogCritical($"RemoveFile, BLOB does not exist, storageId: {storageId}, userId: {userId}, path: {path}");
                return;
            }

            await blobContainer.DeleteBlobAsync(path);
        }

        public async Task RemoveFiles(StoragesEnum storageId, string userId, params string[] pathes)
        {
            foreach (var path in pathes)
            {
                if (!string.IsNullOrEmpty(path))
                {
                    await RemoveFile(storageId, userId, path);
                }
            }
        }


        private BlobHttpHeaders GetBlobHttpHeaders(string contentType)
        {
            var headers = new BlobHttpHeaders();
            headers.ContentType = contentType;
            return headers;
        }


        public async Task<UploadFileResult> SaveFile(StoragesEnum storageId, string userId, byte[] file, string contentType, string prefixFolder, string contentId, string fileName)
        {
            var blobContainer = GetBlobContainerClient(storageId, userId);
            var path = PathFactory(prefixFolder, contentId, fileName);
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

            return new UploadFileResult
            {
                FileName = fileName,
                FilePath = blobClient.Name,
                StorageFileSize = blobClient.GetProperties().Value.ContentLength,
                UploadedFileSize = file.Length
            };
        }

        public async Task<string> CopyBlobAsync(
            StoragesEnum storageFromId, string userFromId, string pathFrom, 
            StoragesEnum storageToId, string userToId,
            string prefixFolder, string contentId, string fileName)
        {
            var blobContainerFrom = GetBlobContainerClient(storageFromId, userFromId);
            var blobContainerTo = GetBlobContainerClient(storageToId, userToId);

            BlobClient sourceBlob = blobContainerFrom.GetBlobClient(pathFrom);

            // Lease the source blob for the copy operation 
            // to prevent another client from modifying it.
            BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();

            try
            {
                if (await sourceBlob.ExistsAsync())
                {
                    // Specifying -1 for the lease interval creates an infinite lease.
                    await lease.AcquireAsync(TimeSpan.FromMinutes(10));

                    // Get the source blob's properties and display the lease state.
                    BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();

                    // Get a BlobClient representing the destination blob with a unique name.
                    BlobClient destBlob = blobContainerTo.GetBlobClient(PathFactory(prefixFolder, contentId, fileName));

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
                await lease.BreakAsync();
                logger.LogDebug(ex.ToString());
                throw;
            }
        }

        public async Task<long> GetUsedDiskSpace(StoragesEnum storageId, string userId)
        {
            var blobContainer = GetBlobContainerClient(storageId, userId);
            var files = blobContainer.GetBlobsByHierarchyAsync();
            long length = 0;
            await foreach (var file in files)
            {
                length += file.Blob.Properties.ContentLength.Value;
            }
            return length;
        }


        public string PathFactory(string prefixFolder, string contentId, string fileName)
        {
            if (string.IsNullOrEmpty(prefixFolder) || string.IsNullOrEmpty(contentId) || string.IsNullOrEmpty(fileName))
            {
                throw new Exception("Invalid file type end");
            }
            return prefixFolder + "/" + contentId + "/" + fileName;
        }

        public async Task CreateUserContainer(StoragesEnum storageId, Guid userId)
        {
            var blobServiceClient = GetBlobServiceClient(storageId);
            var container = await blobServiceClient.CreateBlobContainerAsync(userId.ToString(), PublicAccessType.Blob);
        }
    }
}
