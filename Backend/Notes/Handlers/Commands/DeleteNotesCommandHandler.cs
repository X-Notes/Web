using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using DatabaseContext.Repositories.Histories;
using DatabaseContext.Repositories.NoteContent;
using DatabaseContext.Repositories.Notes;
using Editor.Services;
using MediatR;
using Notes.Commands;
using Permissions.Queries;

namespace Notes.Handlers.Commands;

public class DeleteNotesCommandHandler : IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly NoteSnapshotRepository noteSnapshotRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly BaseNoteContentRepository collectionNoteRepository;

    public DeleteNotesCommandHandler(
        IMediator mediator, 
        NoteRepository noteRepository,
        NoteSnapshotRepository noteSnapshotRepository,
        CollectionLinkedService collectionLinkedService,
        BaseNoteContentRepository collectionNoteRepository)
    {
        this.mediator = mediator;
        this.noteRepository = noteRepository;
        this.noteSnapshotRepository = noteSnapshotRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.collectionNoteRepository = collectionNoteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var noteIds = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.NoteId).ToList();
        
        if (!noteIds.Any())
        {
            return new OperationResult<Unit>().SetNotFound();
        }

        var notes = await noteRepository.GetWhereAsync(x => noteIds.Contains(x.Id));
        
        await DeleteNotesAsync(notes);

        return new OperationResult<Unit>(true, Unit.Value);
    }

    public async Task DeleteNotesAsync(List<Note> notesToDelete)
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