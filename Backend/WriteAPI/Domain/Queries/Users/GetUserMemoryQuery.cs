using Domain.Queries.Files;
using MediatR;


namespace Domain.Queries.Users
{
    public class GetUserMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemoryQuery(string Email) : base(Email)
        {

        }
    }
}
