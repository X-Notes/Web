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
        if (textForUpdate != null)
        {
            textForUpdate.UpdatedAt = DateTimeProvider.Time;
            textForUpdate.NoteTextTypeId = textDiff.NoteTextTypeId ?? textForUpdate.NoteTextTypeId;
            textForUpdate.HTypeId = textDiff.HeadingTypeId ?? textForUpdate.HTypeId;
            textForUpdate.Checked = textDiff.Checked ?? textForUpdate.Checked;

            ProcessContents(textForUpdate, textDiff.BlockDiffs);

            await textNotesRepository.UpdateAsync(textForUpdate);

            if (isMultiplyUpdate)
            {
                var updates = new UpdateTextWS(textDiff);
                await appSignalRService.UpdateTextContent(noteId, userId, updates);
            }
        }
    }

    private void ProcessContents(TextNote textNote, List<BlockDiff>? blockDiffs)
    { 
        if (blockDiffs == null || blockDiffs.Count == 0) return;

        textNote.Contents ??= new List<TextBlock>();

        for (var i = 0; i < blockDiffs.Count; i++)
        {
            var diffs = blockDiffs[i];
            if (i < textNote.Contents.Count)
            {
                var currentBlock = textNote.Contents[i];
                ApplyBlockDiffs(diffs, currentBlock);
            }
            else
            {
                var newBlock = new TextBlock
                {
                    Id = diffs.Id,
                };
                ApplyBlockDiffs(diffs, newBlock);
                textNote.Contents.Add(newBlock);
            }
        }
    }

    private void ApplyBlockDiffs(BlockDiff blockDiff, TextBlock block)
    {
        if (block != null)
        {
            block.HighlightColor = blockDiff.HighlightColor ?? block.HighlightColor;
            block.HighlightColor = block.HighlightColor == "d" ? null : block.HighlightColor;

            block.TextColor = blockDiff.TextColor ?? block.TextColor;
            block.TextColor = block.TextColor == "d" ? null : block.TextColor; // d - default color

            block.Link = blockDiff.Link ?? block.Link;
            block.TextTypes = blockDiff.TextTypes ?? block.TextTypes;

            // UPDATE LETTERS
            if (blockDiff.LetterIdsToDelete?.Count > 0)
            {
                block.Letters = block.Letters?.Where(x => !blockDiff.LetterIdsToDelete!.Contains(x.Id)).ToList();
            }
            if (blockDiff.LettersToAdd?.Count > 0)
            {
                block.Letters ??= new List<BlockLetter>();
                block.Letters.AddRange(blockDiff.LettersToAdd!);
            }
        }
    }
}
