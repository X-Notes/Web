using Common;
using Noots.API.Workers.Models.Config;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Editor.Services;

namespace Noots.API.Workers.BI;

public class MarkLostFilesAsUnlinkedJobHandler
{
    private readonly ILogger<MarkLostFilesAsUnlinkedJobHandler> logger;
    private readonly FileRepository fileRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly JobsTimerConfig timersConfig;

    public MarkLostFilesAsUnlinkedJobHandler(
        ILogger<MarkLostFilesAsUnlinkedJobHandler> logger,
        FileRepository fileRepository,
        CollectionLinkedService collectionLinkedService,
        JobsTimerConfig timersConfig)
    {
        this.logger = logger;
        this.fileRepository = fileRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.timersConfig = timersConfig;
    }

    public async Task HandleAsync()
    {
        await MarkFilesAsync();
    }


    private async Task MarkFilesAsync()
    {
        try
        {
            logger.LogInformation("MarkFilesAsync");

            var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.LostFilesCheckedDays);

            var files = await fileRepository.GetFilesIncludeAllByLostCheckedDateAsync(200, earliestTimestamp);

            if (!files.Any()) return;

            var fileIdsToUnlink = files.Where(x => !x.IsLinkedSomeWhere()).Select(x => x.Id).ToList();

            if (fileIdsToUnlink.Any())
            {
                logger.LogWarning($"{fileIdsToUnlink.Count()} files will be marked as unlinked");

                await collectionLinkedService.UnlinkFiles(fileIdsToUnlink);

                logger.LogInformation("Finished");
            }

            files.ForEach(x => x.LostCheckedAt = DateTimeProvider.Time);

            await fileRepository.UpdateRangeAsync(files);
        }
        catch (Exception ex)
        {
            logger.LogError(ex.ToString());
        }
    }
}
