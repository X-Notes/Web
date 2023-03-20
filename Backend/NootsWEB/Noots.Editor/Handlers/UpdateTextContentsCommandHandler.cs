using Common;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.Editor.Commands;
using Noots.Editor.Entities.Text;
using Noots.Editor.Entities.WS;
using Noots.Editor.Impl;
using Noots.History.Impl;
using Noots.Permissions.Queries;

namespace Noots.Editor.Handlers;

public class UpdateTextContentsCommandHandler : IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>
{
    private readonly IMediator _mediator;

    private readonly EditorSignalRService appSignalRService;

    private readonly TextNotesRepository textNotesRepository;

    private readonly HistoryCacheService historyCacheService;

    public UpdateTextContentsCommandHandler(
        IMediator _mediator,
        EditorSignalRService appSignalRService,
        TextNotesRepository textNotesRepository,
        HistoryCacheService historyCacheService)
    {
        this._mediator = _mediator;
        this.appSignalRService = appSignalRService;
        this.textNotesRepository = textNotesRepository;
        this.historyCacheService = historyCacheService;
    }

    public async Task<OperationResult<Unit>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await _mediator.Send(command);

        if (permissions.CanWrite)
        {
            foreach (var textDiff in request.Updates)
            {
                await UpdateOne(textDiff, request.NoteId, permissions.Caller.Id, permissions.IsMultiplyUpdate);
            }

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            return new OperationResult<Unit>(success: true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }

    private async Task UpdateOne(TextDiff textDiff, Guid noteId, Guid userId, bool isMultiplyUpdate)
    {
        var textForUpdate = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == textDiff.ContentId);

        if (textForUpdate == null) return;

        textForUpdate.UpdatedAt = DateTimeProvider.Time;
        textForUpdate.NoteTextTypeId = textDiff.NoteTextTypeId ?? textForUpdate.NoteTextTypeId;
        textForUpdate.HTypeId = textDiff.HeadingTypeId ?? textForUpdate.HTypeId;
        textForUpdate.Checked = textDiff.Checked ?? textForUpdate.Checked;

        ProcessContents(textForUpdate, textDiff.BlockDiffs);

        await textNotesRepository.UpdateAsync(textForUpdate);

        if (isMultiplyUpdate && textDiff != null)
        {
            textDiff.BlockDiffs?.ForEach(x =>
            {
                if (x.MergeOps != null)
                {
                    x.MergeOps.Ops = x.MergeOps.ValidOps;
                }
            });

            var updates = new UpdateTextWS(textDiff);

            await appSignalRService.UpdateTextContent(noteId, userId, updates);
        }
    }

    private void ProcessContents(TextNote textNote, List<BlockDiff>? blockDiffs)
    { 
        if (blockDiffs == null || blockDiffs.Count == 0) return;

        var contents = textNote.GetContents() ?? new List<TextBlock>();

        AlignBlocks(contents, blockDiffs);
        ProcessText(contents, blockDiffs);
        ProcessProps(contents, blockDiffs);

        textNote.SetContents(contents);
    }

    private void AlignBlocks(List<TextBlock> contents, List<BlockDiff> blockDiffs)
    {
        if (blockDiffs.Count > contents.Count)
        {
            var countToAdd = blockDiffs.Count - contents.Count;

            for(var i = 0; i < countToAdd; i++)
            {
                contents.Add(new TextBlock());
            }
        }
    }

    private void ProcessText(List<TextBlock> contents, List<BlockDiff> blockDiffs)
    {
        for(var i = 0; i < blockDiffs.Count; i++)
        {
            var diffs = blockDiffs[i];
            var stateBlockToUpdate = contents[i];
            if(diffs.MergeOps != null)
            {
                stateBlockToUpdate.UpdateTree(diffs.MergeOps);
            }
        }
    }

    private void ProcessProps(List<TextBlock> contents, List<BlockDiff> blockDiffs)
    {
        for (var i = 0; i < blockDiffs.Count; i++)
        {
            var diffs = blockDiffs[i];
            var stateBlockToUpdate = contents[i];

            if (diffs.HighlightColor != null)
            {
                stateBlockToUpdate.UpdateHighlightColor(diffs.HighlightColor);
            }
            if (diffs.Link != null)
            {
                stateBlockToUpdate.UpdateLink(diffs.Link);
            }
            if (diffs.TextColor != null)
            {
                stateBlockToUpdate.UpdateTextColor(diffs.TextColor);
            }
            if (diffs.TextTypes != null)
            {
                stateBlockToUpdate.UpdateTextTypes(diffs.TextTypes);
            }
        }
    }
}
