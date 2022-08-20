using Common.CQRS;
using Common.DTO.Backgrounds;
using MediatR;

namespace Noots.Backgrounds.Queries
{
    public class GetUserBackgroundsQuery : BaseQueryEntity, IRequest<List<BackgroundDTO>>
    {
        public GetUserBackgroundsQuery(Guid userId) : base(userId)
        {

        }
    }
}
