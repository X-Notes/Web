using Common.CQRS;
using Common.DTO.Notes;
using MediatR;

namespace Notes.Queries
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public int TakeContents { set; get; }
    }
}
