using Common.Attributes;
using Common.DTO.Notes.FullNoteContent.Files;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.NoteInner
{
    public class GetNoteFilesByIdsQuery<T> : BaseQueryEntity, IRequest<List<T>> where T : BaseFileNoteDTO
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid CollectionId { set; get; }

        [RequiredListNotEmpty]
        public List<Guid> FileIds { set; get; }
    }
}
