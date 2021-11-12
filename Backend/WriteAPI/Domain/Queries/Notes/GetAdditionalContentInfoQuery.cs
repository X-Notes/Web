using Common.DTO.Notes.AdditionalContent;
using MediatR;
using System;
using System.Collections.Generic;
using Common.Attributes;

namespace Domain.Queries.Notes
{
    public class GetAdditionalContentInfoQuery : BaseQueryEntity, IRequest<List<BottomNoteContent>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> NoteIds { set; get; }

        public GetAdditionalContentInfoQuery(List<Guid> noteIds)
        {
            NoteIds = noteIds;
        }
    }
}
