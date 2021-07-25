using MediatR;

namespace Domain.Queries.Users
{
    public class GetUserMemoryResponse
    {
        public long TotalSize { set; get; }
    }

    public class GetUserMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemoryQuery(string Email) :base(Email)
        {
        }
    }
}
