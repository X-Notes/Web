using Common.DTO.users;
using MediatR;


namespace Domain.Queries.users
{
    public class GetShortUser : BaseQueryEntity, IRequest<ShortUser>
    {
        public GetShortUser(string Email) :base(Email)
        {
        }
    }
}
