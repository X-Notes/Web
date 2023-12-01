using Common.Channels;
using History.Impl;

namespace WebAPI.Hosted;

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
        await foreach (var item in ChannelsService.HistoryChannel.Reader.ReadAllAsync())
        {
            try
            {
                if (item != null)
                {
                    using var scope = serviceProvider.CreateScope();
                    var historyCacheService = scope.ServiceProvider.GetRequiredService<HistoryCacheService>();

                    await historyCacheService.ProcessChangeAsync(item);
                }
            }
            catch (Exception e)
            {
                logger.LogError(e.ToString());
            }
        }
    }
}
