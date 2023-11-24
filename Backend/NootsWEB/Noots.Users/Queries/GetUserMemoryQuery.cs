using Common.CQRS;
using MediatR;
using Storage.Queries;

namespace Users.Queries
{
    public class GetUserMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemoryQuery(Guid userId) : base(userId)
        {

        }
    }
}
