using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Users.Entities;

namespace Domain.Queries.Users
{
    public class GetUserShortDTOQuery : BaseQueryEntity, IRequest<OperationResult<ShortUser>>
    {
        public GetUserShortDTOQuery(Guid userId) :base(userId)
        {
        }
    }
}
