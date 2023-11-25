using Common.DTO.Notes;
using Common.DTO.Personalization;
using DatabaseContext.Repositories.Notes;
using MapperLocked;
using MediatR;
using RelatedNotes.Queries;

namespace RelatedNotes.Handlers.Queries;

public class GetRelatedNotesQueryHandler : IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>
{
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    private readonly NoteRepository noteRepository;
    private readonly MapperLockedEntities mapperLockedEntities;

    public GetRelatedNotesQueryHandler(
        RelatedNoteToInnerNoteRepository relatedRepository,
        NoteRepository noteRepository,
        MapperLockedEntities mapperLockedEntities)
    {
        this.relatedRepository = relatedRepository;
        this.noteRepository = noteRepository;
        this.mapperLockedEntities = mapperLockedEntities;
    }

    public async Task<List<RelatedNote>> Handle(GetRelatedNotesQuery request, CancellationToken cancellationToken)
    {
        var relatedNotes = await relatedRepository.GetByNoteId(request.NoteId);
        var ids = relatedNotes.Select(x => x.RelatedNoteId);
        var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(ids, new PersonalizationSettingDTO().GetRelated());
        var lookUp = notes.ToDictionary(x => x.Id);
        relatedNotes.ForEach(x => x.RelatedNote = lookUp.ContainsKey(x.RelatedNoteId) ? lookUp[x.RelatedNoteId] : null);
        return mapperLockedEntities.MapNotesToRelatedNotes(relatedNotes, request.UserId);
    }
}