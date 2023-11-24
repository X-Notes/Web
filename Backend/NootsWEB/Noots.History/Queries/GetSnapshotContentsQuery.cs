using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace History.Queries
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
            NoteId = noteId;
            SnapshotId = snapshotId;
        }
    }
}
