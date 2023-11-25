using Common.CQRS;
using Common.DTO;
using MediatR;
using Users.Entities;

namespace Users.Queries
{
    public class GetUserShortDTOQuery : BaseQueryEntity, IRequest<OperationResult<ShortUser>>
    {
        public GetUserShortDTOQuery(Guid userId) :base(userId)
        {
        }
    }
}
