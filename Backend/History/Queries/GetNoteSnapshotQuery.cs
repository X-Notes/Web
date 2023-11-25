using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using History.Entities;
using MediatR;

namespace History.Queries
{
    public class GetNoteSnapshotQuery : BaseQueryEntity, IRequest<OperationResult<NoteHistoryDTOAnswer>>
    {
        [ValidationGuid]
        public Guid SnapshotId { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        public GetNoteSnapshotQuery(Guid snapshotId, Guid noteId, Guid userId)
        {
            SnapshotId = snapshotId;
            NoteId = noteId;
            UserId = userId;
        }
    }
}
