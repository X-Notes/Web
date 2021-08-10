using MediatR;

namespace Domain.Queries.Files
{
    public class GetUserMemoryResponse
    {
        public long TotalSize { set; get; }
    }

    public class GetUserStorageMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserStorageMemoryQuery(string Email) : base(Email)
        {
        }
    }
}
