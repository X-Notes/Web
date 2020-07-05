using Common.DTO.users;
using MediatR;


namespace Domain.Queries.users
{
    public class GetShortUser : IRequest<ShortUser>
    {
        public string Email { set; get; }
        public GetShortUser(string Email)
        {
            this.Email = Email;
        }
    }
}
