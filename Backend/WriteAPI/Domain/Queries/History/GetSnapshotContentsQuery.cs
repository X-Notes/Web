using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.History
{
    public class GetSnapshotContentsQuery : BaseQueryEntity, IRequest<OperationResult<List<BaseNoteContentDTO>>>
    {
        [ValidationGuid]
        public Guid SnapshotId { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        public GetSnapshotContentsQuery(Guid userId, Guid noteId, Guid snapshotId)
            : base(userId)
        {
            this.NoteId = noteId;
            this.SnapshotId = snapshotId;
        }
    }
}
