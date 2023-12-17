using Common.DTO;
using DatabaseContext.Repositories.Labels;
using DatabaseContext.Repositories.Notes;
using Mapper.Mapping;
using MediatR;
using Notes.Commands.Sync;
using Notes.Entities;
using Permissions.Queries;

namespace Notes.Handlers.Sync;

public class SyncNoteStateCommandHandler : IRequestHandler<SyncNoteStateCommand, OperationResult<SyncNoteResult>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteFolderLabelMapper noteFolderLabelMapper;
    private readonly NoteRepository noteRepository;

    public SyncNoteStateCommandHandler(
        IMediator mediator, 
        LabelsNotesRepository labelsNotesRepository,
        NoteFolderLabelMapper noteFolderLabelMapper,
        NoteRepository noteRepository)
    {
        this.mediator = mediator;
        this.labelsNotesRepository = labelsNotesRepository;
        this.noteFolderLabelMapper = noteFolderLabelMapper;
        this.noteRepository = noteRepository;
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

        var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == request.NoteId);
        
        if(note.Version > request.Version)
        {
            var labels = await labelsNotesRepository.GetLabelsAsync(note.Id);

            var res = new SyncNoteResult {
                Color = note.Color,
                Version = note.Version,
                NoteId = note.Id,
                Title = note.Title,
                Labels = noteFolderLabelMapper.MapLabelsToLabelsDTO(labels)
            };

            return new OperationResult<SyncNoteResult>(true, res);
        }

        return new OperationResult<SyncNoteResult>(true, null!);
    }
}
