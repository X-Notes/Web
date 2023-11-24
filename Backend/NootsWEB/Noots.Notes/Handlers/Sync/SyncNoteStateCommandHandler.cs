using Common.DTO;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Permissions.Queries;
using Notes.Commands.Sync;
using Notes.Entities;

namespace Notes.Handlers.Sync;

public class SyncNoteStateCommandHandler : IRequestHandler<SyncNoteStateCommand, OperationResult<SyncNoteResult>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteFolderLabelMapper noteFolderLabelMapper;

    public SyncNoteStateCommandHandler(
        IMediator mediator, 
        LabelsNotesRepository labelsNotesRepository,
        NoteFolderLabelMapper noteFolderLabelMapper)
    {
        this.mediator = mediator;
        this.labelsNotesRepository = labelsNotesRepository;
        this.noteFolderLabelMapper = noteFolderLabelMapper;
    }

    public async Task<OperationResult<SyncNoteResult>> Handle(SyncNoteStateCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permission = await mediator.Send(command);
        var isCanRead = permission.CanRead;

        if (request.FolderId.HasValue && !isCanRead)
        {
            var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
            var permissionsFolder = await mediator.Send(queryFolder);
            isCanRead = permissionsFolder.CanRead;
        }

        if (!isCanRead)
        {
            return new OperationResult<SyncNoteResult>().SetNoPermissions();
        }

        if(permission.Note.Version > request.Version)
        {
            var labels = await labelsNotesRepository.GetLabelsAsync(permission.Note.Id);

            var res = new SyncNoteResult {
                Color = permission.Note.Color,
                Version = permission.Note.Version,
                NoteId = permission.Note.Id,
                Title = permission.Note.Title,
                Labels = noteFolderLabelMapper.MapLabelsToLabelsDTO(labels)
            };

            return new OperationResult<SyncNoteResult>(true, res);
        }

        return new OperationResult<SyncNoteResult>(true, null!);
    }
}
