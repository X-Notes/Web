using MediatR;
using System;

namespace Domain.Queries.Files
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
