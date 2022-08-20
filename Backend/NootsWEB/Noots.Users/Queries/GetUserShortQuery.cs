using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Users.Entities;

namespace Noots.Users.Queries
{
    public class GetUserShortDTOQuery : BaseQueryEntity, IRequest<OperationResult<ShortUser>>
    {
        public GetUserShortDTOQuery(Guid userId) :base(userId)
        {
        }
    }
}
