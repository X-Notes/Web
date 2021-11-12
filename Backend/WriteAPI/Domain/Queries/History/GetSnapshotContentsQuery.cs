using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.History
{
    public class GetSnapshotContentsQuery : BaseQueryEntity, IRequest<List<BaseNoteContentDTO>>
    {
        [ValidationGuid]
        public Guid SnapshotId { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        public GetSnapshotContentsQuery(string email, Guid noteId, Guid snapshotId)
            : base(email)
        {
            this.NoteId = noteId;
            this.SnapshotId = snapshotId;
        }
    }
}
