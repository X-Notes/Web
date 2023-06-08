using Common.DatabaseModels.Models.NoteContent.TextContent;
using Noots.DatabaseContext.Repositories.NoteContent;

namespace Noots.API.Workers.BI;

public class IndexTextNoteContentJobHandler
{
    private readonly TextNotesRepository textNotesRepository;
    private readonly TextNoteIndexRepository textNoteIndexRepository;
    private readonly ILogger<IndexTextNoteContentJobHandler> logger;

    public IndexTextNoteContentJobHandler(
        TextNotesRepository textNotesRepository, 
        TextNoteIndexRepository textNoteIndexRepository,
        ILogger<IndexTextNoteContentJobHandler> logger)
    {
        this.textNotesRepository = textNotesRepository;
        this.textNoteIndexRepository = textNoteIndexRepository;
        this.logger = logger;
    }

    public async Task Handle()
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
        catch(Exception e)
        {
            logger.LogError(e.ToString());
        }
    }
}
