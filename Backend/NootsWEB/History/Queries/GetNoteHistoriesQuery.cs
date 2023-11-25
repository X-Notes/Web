using Common.CQRS;
using Common.DTO;
using History.Entities;
using MediatR;

namespace History.Queries
{
    public class GetNoteHistoriesQuery : BaseQueryEntity, IRequest<OperationResult<List<NoteHistoryDTO>>>
    {
        public Guid NoteId { set; get; }
        public GetNoteHistoriesQuery(Guid NoteId, Guid userId)
        {
            this.NoteId = NoteId;
            UserId = userId;
        }
    }
}
