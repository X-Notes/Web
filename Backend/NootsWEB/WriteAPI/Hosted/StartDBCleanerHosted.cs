using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.WS;

namespace WriteAPI.Hosted
{
    public class StartDBCleanerHosted : BackgroundService
    {
        private readonly IServiceScopeFactory scopeFactory;

        public StartDBCleanerHosted(IServiceScopeFactory scopeFactory)
        {
            this.scopeFactory = scopeFactory;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var scope = scopeFactory.CreateScope();   
            var repo = scope.ServiceProvider.GetRequiredService<UserIdentifierConnectionIdRepository>();
            var values = await repo.GetAllAsync();
            await repo.RemoveRangeAsync(values);
        }
    }
}
