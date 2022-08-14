using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Domain.Queries.RelatedNotes;
using MediatR;
using Noots.MapperLocked;
using WriteContext.Repositories.Notes;

namespace BI.Services.RelatedNotes
{
    public class RelatedNotesHandlerQuery: IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>
    {
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;

        private readonly NoteRepository noteRepository;

        private readonly MapperLockedEntities mapperLockedEntities;

        public RelatedNotesHandlerQuery(
            ReletatedNoteToInnerNoteRepository relatedRepository,
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
            var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(ids, null);
            var lookUp = notes.ToDictionary(x => x.Id);
            relatedNotes.ForEach(x => x.RelatedNote = lookUp.ContainsKey(x.RelatedNoteId) ? lookUp[x.RelatedNoteId] : null);
            return mapperLockedEntities.MapNotesToRelatedNotes(relatedNotes, request.UserId);
        }
    }
}
