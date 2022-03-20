using Common.Attributes;
using Common.DTO;
using Common.DTO.History;
using MediatR;
using System;

namespace Domain.Queries.History
{
    public class GetNoteSnapshotQuery : BaseQueryEntity, IRequest<OperationResult<NoteHistoryDTOAnswer>>
    {
        [ValidationGuid]
        public Guid SnapshotId { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        public GetNoteSnapshotQuery(Guid snapshotId, Guid noteId, Guid userId)
        {
            this.SnapshotId = snapshotId;
            this.NoteId = noteId;
            this.UserId = userId;
        }
    }
}
