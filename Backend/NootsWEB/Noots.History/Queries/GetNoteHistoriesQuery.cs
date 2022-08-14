using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.History.Entities;

namespace Noots.History.Queries
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
