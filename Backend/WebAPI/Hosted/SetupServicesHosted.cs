using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Common.Azure;

namespace API.Hosted
{
    public class SetupServicesHosted : BackgroundService
    {
        private readonly AzureConfig azureConfig;

        private readonly ILogger<SetupServicesHosted> logger;

        public SetupServicesHosted(AzureConfig azureConfig, ILogger<SetupServicesHosted> logger)
        {
            this.azureConfig = azureConfig;
            this.logger = logger;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            foreach (var storage in azureConfig.GetAll())
            {
                var blobServiceClient = new BlobServiceClient(storage.Connection);
                var props = await blobServiceClient.GetPropertiesAsync();

                var prevVersion = "2017-04-17";
                var version = "2019-07-07";

                if (props.Value.DefaultServiceVersion != version)
                {
                    props.Value.DefaultServiceVersion = version;
                }

                props.Value.Cors.Clear();
                props.Value.Cors.Add(
                    new BlobCorsRule
                    {
                        AllowedOrigins = "*",
                        AllowedHeaders = "*",
                        ExposedHeaders = "*",
                        AllowedMethods = "GET,OPTIONS,POST,MERGE,HEAD,DELETE,PATCH,PUT"
                    }
                );

                await blobServiceClient.SetPropertiesAsync(props);

                await TryToCreateMock(blobServiceClient);
            }
        }

        private async Task TryToCreateMock(BlobServiceClient blobServiceClient)
        {
            try
            {
                var containerHealthCheckName = "health-check";
                var container = blobServiceClient.GetBlobContainerClient(containerHealthCheckName);
                var containerExist = await container.ExistsAsync();

                if (!containerExist)
                {
                    await container.CreateIfNotExistsAsync();
                }

                var blobHealthCheckName = "health.txt";
                var blobClient = container.GetBlobClient(blobHealthCheckName);
                var isExist = await blobClient.ExistsAsync();
                if (!isExist)
                {
                    var file = GetEmptyFile();
                    using var ms = new MemoryStream(file);
                    await blobClient.UploadAsync(ms, new BlobHttpHeaders { ContentType = "text/plain" });
                }
            }
            catch (Exception e)
            {
                logger.LogError(e.ToString());
            }
        }

        private byte[] GetEmptyFile()
        {
            using var ms = new MemoryStream();
            using TextWriter tw = new StreamWriter(ms);
            tw.Write("HI");
            tw.Flush();
            ms.Position = 0;
            return ms.ToArray();
        }
    }
}
