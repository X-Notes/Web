using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Services.History;

namespace WriteAPI.Hosted
{
    public class HistoryHosted : IHostedService, IDisposable
    {
        private Timer _timer;
        private readonly HistoryService historyService;
        private readonly IServiceScopeFactory serviceScopeFactory;
        public HistoryHosted(IServiceScopeFactory serviceScopeFactory, HistoryService historyService)
        {
            this.serviceScopeFactory = serviceScopeFactory;
            this.historyService = historyService;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(20));
            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            historyService.DoWork();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }
    }
}
