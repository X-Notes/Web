using Common.CQRS;
using MediatR;
using Noots.Storage.Queries;

namespace Noots.Users.Queries
{
    public class GetUserMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemoryQuery(Guid userId) : base(userId)
        {

        }
    }
}
