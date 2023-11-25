using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Common.Azure;
using Common.DatabaseModels.Models.Files.Models;
using Microsoft.Extensions.Logging;
using Storage.Entities;
using Storage.Interfaces;

namespace Storage.Impl.AzureStorage
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

        private async Task<BlobContainerClient> GetBlobContainerClientAsync(StoragesEnum storageId, string userId)
        {
            var service = GetBlobServiceClient(storageId);
            var blobClient = service.GetBlobContainerClient(userId);

            await blobClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            return blobClient;
        }

        private async Task<BlobClient> GetBlobClientAsync(StoragesEnum storageId, string userId, string path)
        {
            var blobContainerClient = await GetBlobContainerClientAsync(storageId, userId);
            return blobContainerClient.GetBlobClient(path);
        }


        public async Task<GetFileResponse> GetFile(StoragesEnum storageId, string userId, string path)
        {
            var blobClient = await GetBlobClientAsync(storageId, userId, path);
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
            throw new Exception("File does not exist");
        }

        public async Task<bool> RemoveFile(StoragesEnum storageId, string userId, string path)
        {
            var blobContainer = await GetBlobContainerClientAsync(storageId, userId);

            var blob = blobContainer.GetBlobClient(path);
            var blobExist = await blob.ExistsAsync();

            if (!blobExist)
            {
                logger.LogCritical($"RemoveFile, BLOB does not exist, storageId: {storageId}, userId: {userId}, path: {path}");
                return false;
            }

            try
            {
                await blobContainer.DeleteBlobAsync(path);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogCritical(ex.ToString());
            }

            return false;
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
            var blobContainer = await GetBlobContainerClientAsync(storageId, userId);
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

        public async Task<(bool success, string path)> CopyBlobAsync(
            StoragesEnum storageFromId, string userFromId, string pathFrom,
            StoragesEnum storageToId, string userToId,
            string prefixFolder, string contentId, string fileName)
        {
            var blobContainerFrom = await GetBlobContainerClientAsync(storageFromId, userFromId);
            var blobContainerTo = await GetBlobContainerClientAsync(storageToId, userToId);

            BlobClient sourceBlob = blobContainerFrom.GetBlobClient(pathFrom);

            // Lease the source blob for the copy operation
            // to prevent another client from modifying it.
            BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();

            try
            {
                if (!await sourceBlob.ExistsAsync())
                {
                    throw new Exception("Blob does not exist");
                }

                // Specifying -1 for the lease interval creates an infinite lease.
                var resp = await lease.AcquireAsync(TimeSpan.FromSeconds(-1));

                // Get the source blob's properties and display the lease state.
                BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();

                // Get a BlobClient representing the destination blob with a unique name.
                BlobClient destBlob = blobContainerTo.GetBlobClient(PathFactory(prefixFolder, contentId, fileName));

                // Start the copy operation.
                CopyFromUriOperation copyOperation = await destBlob.StartCopyFromUriAsync(sourceBlob.Uri);
                await copyOperation.WaitForCompletionAsync();

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

                return (true, destBlob.Name);
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex.ToString());
                await lease.BreakAsync();
            }

            return (false!, null!);
        }

        public async Task<long> GetUsedDiskSpace(StoragesEnum storageId, string userId)
        {
            var blobContainer = await GetBlobContainerClientAsync(storageId, userId);
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
    }
}