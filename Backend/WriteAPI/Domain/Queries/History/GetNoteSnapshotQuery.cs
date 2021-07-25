using Common.DTO.History;
using MediatR;
using System;

namespace Domain.Queries.History
{
    public class GetNoteSnapshotQuery : BaseQueryEntity, IRequest<NoteHistoryDTOAnswer>
    {
        public Guid SnapshotId { set; get; }

        public Guid NoteId { set; get; }

        public GetNoteSnapshotQuery(Guid snapshotId, Guid noteId, string Email)
        {
            this.SnapshotId = snapshotId;
            this.NoteId = noteId;
            this.Email = Email;
        }
    }
}
