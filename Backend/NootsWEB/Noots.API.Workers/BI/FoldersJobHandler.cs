using API.Worker.Models.Config;
using Common;
using DatabaseContext.Repositories.Folders;

namespace API.Worker.BI;

public class FoldersJobHandler
{
    private readonly ILogger<FoldersJobHandler> logger;
    private readonly JobsTimerConfig timersConfig;
    private readonly FolderRepository folderRepository;

    public FoldersJobHandler(ILogger<FoldersJobHandler> logger, JobsTimerConfig timersConfig, FolderRepository folderRepository)
	{
        this.logger = logger;
        this.timersConfig = timersConfig;
        this.folderRepository = folderRepository;
    }

    public async Task HandleAsync()
    {
        await DeleteFoldersHandler();
    }

    private async Task DeleteFoldersHandler()
    {
        try
        {
            logger.LogInformation("Start folders deleting");

            var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteFoldersNDays);
            var folders = await folderRepository.GetFoldersThatNeedDeleteAfterTime(earliestTimestamp);

            if (folders.Any())
            {
                logger.LogInformation($"{folders.Count()} folders will be deleted");
                await folderRepository.RemoveRangeAsync(folders);
                logger.LogInformation("Folders was deleted");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex.ToString());
        }
    }
}
