using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using BI.SignalR;
using Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class SetupServicesHosted : BackgroundService
    {
        private readonly BlobServiceClient blobServiceClient;

        public SetupServicesHosted(BlobServiceClient blobServiceClient)
        {
            this.blobServiceClient = blobServiceClient;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var props = await this.blobServiceClient.GetPropertiesAsync();

            var prevVersion = "2017-04-17";
            var version = "2019-07-07";

            if (props.Value.DefaultServiceVersion != version)
            {
                props.Value.DefaultServiceVersion = version;
            }

            props.Value.Cors.Clear();
            props.Value.Cors.Add(
                new BlobCorsRule{ 
                    AllowedOrigins = "*",
                    AllowedHeaders = "*",
                    ExposedHeaders = "*",
                    AllowedMethods = "GET,OPTIONS,POST,MERGE,HEAD,DELETE,PATCH,PUT"
                }
            );

            await blobServiceClient.SetPropertiesAsync(props);

            await TryToCreateMock();
        }

        private async Task TryToCreateMock()
        {
            try
            {
                var containerHealthCheckName = "health-check";
                var container = blobServiceClient.GetBlobContainerClient(containerHealthCheckName);
                await container.CreateIfNotExistsAsync();

                var blobHealthCheckName = "health.txt";
                var blobClient = container.GetBlobClient(blobHealthCheckName);
                var isExist = await blobClient.ExistsAsync();
                if (!isExist)
                {
                    var file = GetEmptyFile();
                    using var ms = new MemoryStream(file);
                    await blobClient.UploadAsync(ms, new BlobHttpHeaders { ContentType = "text/plain" });
                }
            } catch(Exception e)
            {
                Console.WriteLine(e);
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
