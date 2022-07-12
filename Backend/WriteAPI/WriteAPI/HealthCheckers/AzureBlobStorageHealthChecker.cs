using Azure.Storage.Blobs;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.HealthCheckers
{
    public class AzureBlobStorageHealthChecker : IHealthCheck
    {
        private readonly BlobServiceClient blobServiceClient;

        public AzureBlobStorageHealthChecker(BlobServiceClient blobServiceClient)
        {
            this.blobServiceClient = blobServiceClient;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var container = blobServiceClient.GetBlobContainerClient("health-check");
                var isExistContainer = await container.ExistsAsync();
                if (!isExistContainer)
                {
                    return HealthCheckResult.Degraded("Container does not exist");
                }

                var blobClient = container.GetBlobClient("health.txt");
                var isExistBlob = await blobClient.ExistsAsync();
                if (!isExistBlob)
                {
                    return HealthCheckResult.Degraded("Blob does not exist");
                }

                return HealthCheckResult.Healthy("Blob storage healthy");

            } catch(Exception e)
            {
                return HealthCheckResult.Unhealthy("Azure Storage does not work");
            }
        }
    }
}
