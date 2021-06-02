using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class StartAppHosted : IHostedService
    {
        private readonly IServiceProvider serviceProvider;

        public StartAppHosted(IServiceProvider services)
        {
            this.serviceProvider = services;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            // using var scope = serviceProvider.CreateScope();
            // using var fileService = scope.ServiceProvider.GetRequiredService<IFilesStorage>();
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
