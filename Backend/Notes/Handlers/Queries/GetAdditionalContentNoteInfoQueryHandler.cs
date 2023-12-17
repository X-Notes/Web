using Common.DTO.Notes.AdditionalContent;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notes.Queries;
using Permissions.Queries;

namespace Notes.Handlers.Queries;

public class GetAdditionalContentNoteInfoQueryHandler : IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>
{
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository;
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;

    public GetAdditionalContentNoteInfoQueryHandler(
        FoldersNotesRepository foldersNotesRepository,
        RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository,
        IMediator mediator,
        NoteRepository noteRepository)
    {
        this.foldersNotesRepository = foldersNotesRepository;
        this.relatedNoteToInnerNoteRepository = relatedNoteToInnerNoteRepository;
        this.mediator = mediator;
        this.noteRepository = noteRepository;
    }
    
    public async Task<List<BottomNoteContent>> Handle(GetAdditionalContentNoteInfoQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var readNoteIds = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();

        if(readNoteIds == null || readNoteIds.Count == 0)
        {
            return new List<BottomNoteContent>();
        }

        var notes = await noteRepository.GetNotesIncludeUsersNoTrackingAsync(readNoteIds);
        var notesDict = notes.ToDictionary(x => x.Id);
        
        var notesFolder = await foldersNotesRepository.GetByNoteIdsIncludeFolderNoTrackingAsync(readNoteIds);
        var notesFolderDict = notesFolder.ToLookup(x => x.NoteId);
        
        var relatedNotes = await relatedNoteToInnerNoteRepository.GeIncludeRootNoteByRelatedNoteIdsNoTrackingAsync(readNoteIds);
        var relatedNotesDict = relatedNotes.ToLookup(x => x.RelatedNoteId);
        
        return readNoteIds.Select(noteId => new BottomNoteContent
        {
            IsHasUserOnNote = notesDict.TryGetValue(noteId, out var value) && value.UsersOnPrivateNotes.Any(),
            NoteId = noteId,
            NoteFolderInfos = notesFolderDict.Contains(noteId) ? notesFolderDict[noteId].Select(x => new NoteFolderInfo(x.FolderId, x.Folder.Title)).ToList() : null,
            NoteRelatedNotes = relatedNotesDict.Contains(noteId) ? relatedNotesDict[noteId].Select(x => new NoteRelatedNoteInfo(x.NoteId, x.Note.Title)).ToList() : null,
        }).ToList();
    }
}