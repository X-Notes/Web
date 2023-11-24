using Common.CQRS;
using Common.DTO.Notes;
using MediatR;

namespace RelatedNotes.Queries
{
    public class GetRelatedNotesQuery : BaseQueryEntity, IRequest<List<RelatedNote>>
    {
        public Guid NoteId { set; get; }

        public GetRelatedNotesQuery(Guid userId, Guid id)
            : base(userId)
        {
            this.NoteId = id;
        }
    }
}
