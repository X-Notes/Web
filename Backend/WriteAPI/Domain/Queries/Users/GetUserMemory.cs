using MediatR;

namespace Domain.Queries.Users
{
    public class GetUserMemoryResponse
    {
        public long TotalSize { set; get; }
    }

    public class GetUserMemory : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemory(string Email) :base(Email)
        {
        }
    }
}
