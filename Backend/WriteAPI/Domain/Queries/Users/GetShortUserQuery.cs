using Common.DTO.Users;
using MediatR;

namespace Domain.Queries.Users
{
    public class GetShortUserQuery : BaseQueryEntity, IRequest<ShortUser>
    {
        public GetShortUserQuery(string Email) :base(Email)
        {
        }
    }
}
