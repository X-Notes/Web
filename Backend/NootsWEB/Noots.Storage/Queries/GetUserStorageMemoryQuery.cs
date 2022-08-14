using Common.CQRS;
using MediatR;

namespace Noots.Storage.Queries
{
    public class GetUserMemoryResponse
    {
        public long TotalSize { set; get; }
    }

    public class GetUserStorageMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserStorageMemoryQuery(Guid userId) : base(userId)
        {
        }
    }
}
