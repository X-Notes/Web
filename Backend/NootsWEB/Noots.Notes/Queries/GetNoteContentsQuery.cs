using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Noots.Notes.Queries
{
    public class GetNoteContentsQuery : BaseQueryEntity, IRequest<OperationResult<List<BaseNoteContentDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        public GetNoteContentsQuery(Guid userId, Guid NoteId)
            : base(userId)
        {
            this.NoteId = NoteId;
        }
    }
}
