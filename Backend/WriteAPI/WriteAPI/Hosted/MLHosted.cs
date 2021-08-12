using FacadeML;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class MLHosted : IHostedService, IDisposable
    {
        private readonly IServiceScopeFactory serviceScopeFactory;

        public MLHosted(IServiceScopeFactory serviceScopeFactory)
        {
            this.serviceScopeFactory = serviceScopeFactory;
        }

        public void Dispose()
        {

        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var ORS = scope.ServiceProvider.GetService<ObjectRecognizeService>();
                // TODO MOVE TO API
                // ORS.Init();
            }
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
