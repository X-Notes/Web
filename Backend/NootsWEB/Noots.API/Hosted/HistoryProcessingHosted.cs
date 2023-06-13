using Common.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Noots.History.Impl;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Noots.API.Hosted;

public class HistoryProcessingHosted : BackgroundService
{
    private readonly ILogger<HistoryProcessingHosted> logger;
    private readonly IServiceProvider serviceProvider;

    public HistoryProcessingHosted(
        ILogger<HistoryProcessingHosted> logger,
        IServiceProvider serviceProvider)
    {
        this.logger = logger;
        this.serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = serviceProvider.CreateScope();
        var historyCacheService = scope.ServiceProvider.GetRequiredService<HistoryCacheService>();

        while (!ChannelsService.HistoryChannel.Reader.Completion.IsCompleted)
        {
            try
            {
                var resp = await ChannelsService.HistoryChannel.Reader.ReadAsync();
                if(resp != null)
                {
                    await historyCacheService.ProcessChangeAsync(resp);
                }
            }
            catch(Exception e)
            {
                logger.LogError(e.ToString());
            }
            finally
            {
                Task.Delay(100);
            }
        }
    }
}
