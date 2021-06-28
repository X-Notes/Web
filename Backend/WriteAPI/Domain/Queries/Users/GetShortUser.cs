using Common.DTO.Users;
using MediatR;

namespace Domain.Queries.Users
{
    public class GetShortUser : BaseQueryEntity, IRequest<ShortUser>
    {
        public GetShortUser(string Email) :base(Email)
        {
        }
    }
}
