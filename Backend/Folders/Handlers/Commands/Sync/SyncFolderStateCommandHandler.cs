using Common.DTO;
using DatabaseContext.Repositories.Folders;
using Folders.Commands.Sync;
using Folders.Entities;
using MediatR;
using Permissions.Queries;

namespace Folders.Handlers.Commands.Sync;

public class SyncFolderStateCommandHandler : IRequestHandler<SyncFolderStateCommand, OperationResult<SyncFolderResult>>
{
    private readonly IMediator mediator;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly FolderRepository folderRepository;

    public SyncFolderStateCommandHandler(
        IMediator mediator, 
        FoldersNotesRepository foldersNotesRepository,
        FolderRepository folderRepository)
    {
        this.mediator = mediator;
        this.foldersNotesRepository = foldersNotesRepository;
        this.folderRepository = folderRepository;
    }

    public async Task<OperationResult<SyncFolderResult>> Handle(SyncFolderStateCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permission = await mediator.Send(command);

        if (!permission.CanRead)
        {
            return new OperationResult<SyncFolderResult>().SetNoPermissions();
        }

        var folder = await folderRepository.FirstOrDefaultAsync(x => x.Id == request.FolderId);
        
        if (folder.Version > request.Version)
        {
            var foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);

            HashSet<Guid> uiIds = request.NoteIds?.ToHashSet() ?? new();
            var dbIds = foldersNotes.Select(x => x.NoteId).ToHashSet();

            var res = new SyncFolderResult
            {
                Color = folder.Color,
                Version = folder.Version,
                FolderId = folder.Id,
                Title = folder.Title,
                NoteIdsToDelete = uiIds.Where(x => !dbIds.Contains(x)).ToList(),
                NoteIdsToAdd = dbIds.Where(x => !uiIds.Contains(x)).ToList()
            };

            return new OperationResult<SyncFolderResult>(true, res);
        }

        return new OperationResult<SyncFolderResult>(true, null!);
    }
}
