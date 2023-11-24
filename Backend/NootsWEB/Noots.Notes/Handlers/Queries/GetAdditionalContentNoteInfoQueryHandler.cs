using Common.DatabaseModels.Models.Files;
using Common.DTO.Notes.AdditionalContent;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Notes.Queries;
using Permissions.Queries;

namespace Notes.Handlers.Queries;

public class GetAdditionalContentNoteInfoQueryHandler : IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>
{
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly CollectionNoteRepository collectionNoteRepository;
    private readonly NoteSnapshotRepository noteSnapshotRepository;
    private readonly RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository;
    private readonly IMediator mediator;

    public GetAdditionalContentNoteInfoQueryHandler(
        FoldersNotesRepository foldersNotesRepository,
        CollectionNoteRepository collectionNoteRepository,
        NoteSnapshotRepository noteSnapshotRepository,
        RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository,
        IMediator mediator)
    {
        this.foldersNotesRepository = foldersNotesRepository;
        this.collectionNoteRepository = collectionNoteRepository;
        this.noteSnapshotRepository = noteSnapshotRepository;
        this.relatedNoteToInnerNoteRepository = relatedNoteToInnerNoteRepository;
        this.mediator = mediator;
    }
    
    public async Task<List<BottomNoteContent>> Handle(GetAdditionalContentNoteInfoQuery request, CancellationToken cancellationToken)
    {
        long GetSize(Guid noteId, params Dictionary<Guid, (Guid, IEnumerable<AppFile>)>[] filesDict)
        {
            return filesDict
                .Where(x => x.ContainsKey(noteId))
                .SelectMany(x => x[noteId].Item2)
                .DistinctBy(x => x.Id)
                .Sum(x => x.Size);
        }

        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var readNoteIds = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();

        if(readNoteIds == null || readNoteIds.Count == 0)
        {
            return new List<BottomNoteContent>();
        }

        var permissionsDict = permissions.ToDictionary(x => x.noteId);

        var notesFolder = await foldersNotesRepository.GetByNoteIdsIncludeFolder(readNoteIds);
        var size = await collectionNoteRepository.GetMemoryOfNotes(readNoteIds);
        var sizeSnapshots = await noteSnapshotRepository.GetMemoryOfNotesSnapshots(readNoteIds);

        var notesNotes = await relatedNoteToInnerNoteRepository.GeIncludeRootNoteByRelatedNoteIds(readNoteIds);
        var notesNotesDict = notesNotes.ToLookup(x => x.RelatedNoteId);

        var notesFolderDict = notesFolder.ToLookup(x => x.NoteId);

        return readNoteIds.Select(noteId => new BottomNoteContent
        {
            IsHasUserOnNote = permissionsDict.ContainsKey(noteId) ? permissionsDict[noteId].perm.SecondUsersHasAccess : false,
            NoteId = noteId,
            NoteFolderInfos = notesFolderDict.Contains(noteId) ? notesFolderDict[noteId].Select(x => new NoteFolderInfo(x.FolderId, x.Folder.Title)).ToList() : null,
            NoteRelatedNotes = notesNotesDict.Contains(noteId) ? notesNotesDict[noteId].Select(x => new NoteRelatedNoteInfo(x.NoteId, x.Note.Title)).ToList() : null,
            TotalSize = GetSize(noteId, size, sizeSnapshots)
        }).ToList();
    }
}