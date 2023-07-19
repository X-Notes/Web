using Common;
using Noots.API.Workers.Models.Config;
using Noots.DatabaseContext.Repositories.Labels;

namespace Noots.API.Workers.BI;

public class LabelsJobHandler
{
    private readonly LabelRepository labelRepostory;
    private readonly ILogger<LabelsJobHandler> logger;
    private readonly JobsTimerConfig timersConfig;

    public LabelsJobHandler(LabelRepository labelRepostory, ILogger<LabelsJobHandler> logger, JobsTimerConfig timersConfig)
    {
        this.labelRepostory = labelRepostory;
        this.logger = logger;
        this.timersConfig = timersConfig;
    }

    public async Task HandleAsync()
    {
        await DeleteLabelsHandler();
    }

    private async Task DeleteLabelsHandler()
    {
        try
        {
            logger.LogInformation("Start labels deleting");

            var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteLabelsNDays);

            var labels = await labelRepostory.GetLabelsThatNeedDeleteAfterTime(earliestTimestamp);

            if (labels.Any())
            {
                logger.LogInformation($"{labels.Count()} labels will be deleted");
                await labelRepostory.RemoveRangeAsync(labels);
                logger.LogInformation("Labels was deleted");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex.ToString());
        }
    }
}
