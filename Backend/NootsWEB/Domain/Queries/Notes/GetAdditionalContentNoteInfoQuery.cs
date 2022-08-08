using Common.DTO.Notes.AdditionalContent;
using MediatR;
using System;
using System.Collections.Generic;
using Common.Attributes;

namespace Domain.Queries.Notes
{
    public class GetAdditionalContentNoteInfoQuery : BaseQueryEntity, IRequest<List<BottomNoteContent>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> NoteIds { set; get; }

        public GetAdditionalContentNoteInfoQuery(List<Guid> noteIds)
        {
            NoteIds = noteIds;
        }
    }
}
