using Common.DatabaseModels.Models.NoteContent;
using Common.DTO;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.Editor.Commands.Sync;
using Noots.Editor.Services.Sync.Entities;
using Noots.Permissions.Queries;

namespace Noots.Editor.Services.Sync;

public class SyncEditorStateCommandHandler : IRequestHandler<SyncEditorStateCommand, OperationResult<SyncStateResult>>
{
    private readonly IMediator mediator;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public SyncEditorStateCommandHandler(IMediator _mediator, BaseNoteContentRepository baseNoteContentRepository, NoteFolderLabelMapper appCustomMapper)
    {
        mediator = _mediator;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.appCustomMapper = appCustomMapper;
    }

    public async Task<OperationResult<SyncStateResult>> Handle(SyncEditorStateCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanRead = permissions.CanRead;

        if (request.FolderId.HasValue && !isCanRead)
        {
            var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
            var permissionsFolder = await mediator.Send(queryFolder);
            isCanRead = permissionsFolder.CanRead;
        }

        if (!isCanRead)
        {
            return new OperationResult<SyncStateResult>().SetNoPermissions();
        }

        var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
        var diffs = await GetDiffs(contents, request.SyncState, permissions.Note.Id, permissions.AuthorId);

        return new OperationResult<SyncStateResult>(true, diffs);
    }

    public async Task<SyncStateResult> GetDiffs(List<BaseNoteContent> dbContents, List<SyncItem> uiState, Guid noteId, Guid ownerId)
    {
        var res = new SyncStateResult();

        var uiIds = uiState.Select(x => x.ContentId).ToHashSet();
        var dbIds = dbContents.Select(x => x.Id).ToHashSet();

        res.IdsToDelete = uiIds.Where(x => !dbIds.Contains(x)).ToList();

        var idsToAdd = dbIds.Where(x => !uiIds.Contains(x)).ToList();

        if(idsToAdd.Count > 0)
        {
            var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(noteId, idsToAdd);
            res.ContentsToAdd = appCustomMapper.MapContentsToContentsDTO(contents, ownerId);
        }

        var dbContentsDict = dbContents.ToDictionary(x => x.Id);
        var idsToUpdate = uiState.Where(ui => dbContentsDict.ContainsKey(ui.ContentId) && dbContentsDict[ui.ContentId].Version > ui.Version)
                                 .Select(x => x.ContentId).ToList();

        if (idsToUpdate.Count > 0)
        {
            var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(noteId, idsToUpdate);
            res.ContentsToUpdate = appCustomMapper.MapContentsToContentsDTO(contents, ownerId);
        }

        return res;
    }
}
