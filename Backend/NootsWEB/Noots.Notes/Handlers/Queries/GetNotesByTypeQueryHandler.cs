using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.MapperLocked;
using Notes.Impl;
using Notes.Queries;

namespace Notes.Handlers.Queries;

public class GetNotesByTypeQueryHandler : IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>
{
    private readonly NotesService notesService;
    private readonly NoteRepository noteRepository;
    private readonly MapperLockedEntities mapperLockedEntities;

    public GetNotesByTypeQueryHandler(NotesService notesService, NoteRepository noteRepository, MapperLockedEntities mapperLockedEntities)
    {
        this.notesService = notesService;
        this.noteRepository = noteRepository;
        this.mapperLockedEntities = mapperLockedEntities;
    }
    
    public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
    {
        var notes = await noteRepository.GetNotesByUserIdAndTypeIdWithContent(request.UserId, request.TypeId, request.Settings);

        if (NoteTypeENUM.Shared == request.TypeId)
        {
            var sharedNotes = await notesService.GetSharedNotes(request.UserId, request.Settings);
            notes.AddRange(sharedNotes);
            notes = notes.DistinctBy(x => x.Id).ToList();
        }

        notes.ForEach(x => x.LabelsNotes = x.LabelsNotes?.OrderBy(x => x.AddedAt).ToList());

        return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
    }
}