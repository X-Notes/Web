using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using BI.SignalR;
using Common;
using Microsoft.Extensions.Hosting;
using System;
using System.Diagnostics;
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
        }
    }
}
