using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Editor.Services;
using Noots.Permissions.Queries;
using Notes.Commands;

namespace Notes.Handlers.Commands;

public class DeleteNotesCommandHandler : IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly NoteSnapshotRepository noteSnapshotRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly CollectionNoteRepository collectionNoteRepository;

    public DeleteNotesCommandHandler(
        IMediator _mediator, 
        NoteRepository noteRepository,
        NoteSnapshotRepository noteSnapshotRepository,
        CollectionLinkedService collectionLinkedService,
        CollectionNoteRepository collectionNoteRepository)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        this.noteSnapshotRepository = noteSnapshotRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.collectionNoteRepository = collectionNoteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var notes = permissions.Where(x => x.perm.IsOwner);

        if (!notes.Any())
        {
            return new OperationResult<Unit>().SetNotFound();
        }

        var notesToDelete = notes.Select(x => x.perm.Note);
        await DeleteNotesAsync(notesToDelete);

        return new OperationResult<Unit>(true, Unit.Value);
    }

    public async Task DeleteNotesAsync(IEnumerable<Note> notesToDelete)
    {
        var noteIds = notesToDelete.Select(x => x.Id);

        // HISTORY DELETION
        var snapshots = await noteSnapshotRepository.GetSnapshotsWithSnapshotFileContent(noteIds);
        var snapshotFileIds = snapshots.SelectMany(x => x.SnapshotFileContents.Select(x => x.AppFileId));

        await noteSnapshotRepository.RemoveRangeAsync(snapshots);

        // CONTENT DELETION
        var collectionsToDelete = await collectionNoteRepository.GetManyIncludeNoteAppFiles(noteIds);
        var collectionFileIds = collectionsToDelete.SelectMany(x => x.CollectionNoteAppFiles.Select(x => x.AppFileId));

        var filesIdsToUnlink = snapshotFileIds.Concat(collectionFileIds).ToHashSet();

        await noteRepository.RemoveRangeAsync(notesToDelete);

        await collectionLinkedService.UnlinkFiles(filesIdsToUnlink);
    }
}