using BI.Mapping;
using Common.DTO.notes;
using Domain.Queries.relatedNotes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.relatedNotes
{
    public class RelatedNotesHandlerQuery
        : IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>,
          IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewRelatedNote>>
    {
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
        private readonly NoteCustomMapper noteCustomMapper;
        public RelatedNotesHandlerQuery(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            NoteCustomMapper noteCustomMapper)
        {
            this.relatedRepository = relatedRepository;
            this.noteCustomMapper = noteCustomMapper;
        }

        public async Task<List<RelatedNote>> Handle(GetRelatedNotesQuery request, CancellationToken cancellationToken)
        {
            var notes = await relatedRepository.GetRelatedNotesFullContent(request.NoteId);
            return noteCustomMapper.TranformNotesToRelatedNotes(notes);
        }

        public Task<List<PreviewRelatedNote>> Handle(GetNotesForPreviewWindowQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
