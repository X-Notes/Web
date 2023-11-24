using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands.Sync;
using Noots.Folders.Entities;
using Permissions.Queries;

namespace Noots.Folders.Handlers.Commands.Sync;

public class SyncFolderStateCommandHandler : IRequestHandler<SyncFolderStateCommand, OperationResult<SyncFolderResult>>
{
    private readonly IMediator mediator;
    private readonly FoldersNotesRepository foldersNotesRepository;

    public SyncFolderStateCommandHandler(IMediator mediator, FoldersNotesRepository foldersNotesRepository)
    {
        this.mediator = mediator;
        this.foldersNotesRepository = foldersNotesRepository;
    }

    public async Task<OperationResult<SyncFolderResult>> Handle(SyncFolderStateCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permission = await mediator.Send(command);

        if (!permission.CanRead)
        {
            return new OperationResult<SyncFolderResult>().SetNoPermissions();
        }

        if (permission.Folder.Version > request.Version)
        {
            var foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);

            HashSet<Guid> uiIds = request.NoteIds?.ToHashSet() ?? new();
            var dbIds = foldersNotes.Select(x => x.NoteId).ToHashSet();

            var res = new SyncFolderResult
            {
                Color = permission.Folder.Color,
                Version = permission.Folder.Version,
                FolderId = permission.Folder.Id,
                Title = permission.Folder.Title,
                NoteIdsToDelete = uiIds.Where(x => !dbIds.Contains(x)).ToList(),
                NoteIdsToAdd = dbIds.Where(x => !uiIds.Contains(x)).ToList()
            };

            return new OperationResult<SyncFolderResult>(true, res);
        }

        return new OperationResult<SyncFolderResult>(true, null!);
    }
}
