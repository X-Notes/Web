using API.Worker.Models.Config;
using Common;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using MediatR;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Commands;
using Noots.History.Impl;
using Notes.Handlers.Commands;

namespace API.Worker.BI;

public class NotesJobHandler
{
    private readonly NoteRepository noteRepository;

    private readonly JobsTimerConfig jobsTimerConfig;

    private readonly NoteSnapshotRepository noteSnapshotRepository;

    private readonly ILogger<NotesJobHandler> logger;

    private readonly DeleteNotesCommandHandler deleteNotesCommandHandler;

    private readonly HistoryCacheService historyCacheService;

    private readonly IServiceScopeFactory serviceScopeFactory;

    private readonly TextNotesRepository textNotesRepository;

    private readonly TextNoteIndexRepository textNoteIndexRepository;

    public NotesJobHandler(
        NoteRepository noteRepository,
        JobsTimerConfig timersConfig,
        NoteSnapshotRepository noteSnapshotRepository,
        ILogger<NotesJobHandler> logger,
        DeleteNotesCommandHandler deleteNotesCommandHandler,
        HistoryCacheService historyCacheService,
        IServiceScopeFactory serviceScopeFactory,
        TextNotesRepository textNotesRepository,
        TextNoteIndexRepository textNoteIndexRepository)
    {
        this.noteRepository = noteRepository;
        jobsTimerConfig = timersConfig;
        this.noteSnapshotRepository = noteSnapshotRepository;
        this.logger = logger;
        this.deleteNotesCommandHandler = deleteNotesCommandHandler;
        this.historyCacheService = historyCacheService;
        this.serviceScopeFactory = serviceScopeFactory;
        this.textNotesRepository = textNotesRepository;
        this.textNoteIndexRepository = textNoteIndexRepository;
    }


    public async Task HandleAsync()
    {
        await DeleteNotesAsync();
        await DeleteHistoriesAsync();
        await MakeHistoriesAsync();
        await SyncNotesContentsIndexAsync();
    }

    private async Task DeleteNotesAsync()
    {
        try
        {
            logger.LogInformation("Start notes deleting");

            var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteNotesNDays);
            var notes = await noteRepository.GetNotesThatNeedDeleteAfterTime(earliestTimestamp);

            if (notes.Any())
            {
                logger.LogInformation($"{notes.Count()} notes will be deleted");
                await deleteNotesCommandHandler.DeleteNotesAsync(notes);
                logger.LogInformation("Notes was deleted");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex.ToString());
        }
    }

    private async Task DeleteHistoriesAsync()
    {
        try
        {
            logger.LogInformation("Start snapshots deleting");

            var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteHistoriesNDays);
            var snapshots = await noteSnapshotRepository.GetSnapshotsThatNeedDeleteAfterTime(earliestTimestamp);

            if (snapshots.Any())
            {
                logger.LogInformation($"{snapshots.Count()} snapshots will be deleted");
                await noteSnapshotRepository.RemoveRangeAsync(snapshots);
                logger.LogInformation("Folders was deleted");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex.ToString());
        }
    }

    private async Task MakeHistoriesAsync()
    {
        try
        {
            logger.LogInformation("Start make history");

            var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-jobsTimerConfig.MakeSnapshotAfterNMinutes);
            var histories = await historyCacheService.GetCacheHistoriesForSnapshotingByTime(earliestTimestamp);
            if (histories.Any())
            {
                try
                {
                    using var scope = serviceScopeFactory.CreateScope();
                    var _mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    foreach (var history in histories)
                    {
                        var command = new MakeNoteHistoryCommand(history.NoteId, history.UsersThatEditIds);
                        var results = await _mediator.Send(command);
                    }
                }
                catch (Exception e)
                {
                    logger.LogError(e.ToString());
                }
                finally
                {
                    await historyCacheService.RemoveUpdateDates(histories);
                }
            }

            logger.LogInformation("End make history");

        }
        catch (Exception e)
        {
            logger.LogError(e.ToString());
        }
    }

    private async Task SyncNotesContentsIndexAsync()
    {
        try
        {
            logger.LogInformation("Start processing text index");

            var ents = await textNotesRepository.GetUnsyncedTexts(5000);

            var newTextsIndex = ents.Where(x => x.TextNoteIndex == null).Select(x =>
            {
                return new TextNoteIndex
                {
                    NoteId = x.NoteId,
                    Content = x.GetContentString(),
                    TextNoteId = x.Id,
                    Version = x.Version
                };
            });
            if (newTextsIndex.Any())
            {
                await textNoteIndexRepository.AddRangeAsync(newTextsIndex);
            }

            var updateTextsIndex = ents.Where(x => x.TextNoteIndex != null).Select(x =>
            {
                x.TextNoteIndex.Content = x.GetContentString();
                x.TextNoteIndex.Version = x.Version;
                return x.TextNoteIndex;
            });
            if (updateTextsIndex.Any())
            {
                await textNoteIndexRepository.UpdateRangeAsync(updateTextsIndex);
            }

        }
        catch (Exception e)
        {
            logger.LogError(e.ToString());
        }
    }
}
