using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.MapperLocked;
using Notes.Impl;
using Notes.Queries;

namespace Notes.Handlers.Queries;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, List<SmallNote>>
{
    private readonly NoteRepository noteRepository;
    private readonly MapperLockedEntities mapperLockedEntities;
    private readonly NotesService notesService;

    public GetAllNotesQueryHandler(
        NoteRepository noteRepository, 
        MapperLockedEntities mapperLockedEntities,
        NotesService notesService)
    {
        this.noteRepository = noteRepository;
        this.mapperLockedEntities = mapperLockedEntities;
        this.notesService = notesService;
    }
    
    public async Task<List<SmallNote>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await noteRepository.GetNotesByUserId(request.UserId, request.Settings);
        var sharedNotes = await notesService.GetSharedNotes(request.UserId, request.Settings);
        notes.AddRange(sharedNotes);
        notes = notes.DistinctBy(x => x.Id).ToList();

        notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.OrderBy(x => x.AddedAt).ToList());
        notes = notes.OrderBy(x => x.Order).ToList();

        return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
    }
}