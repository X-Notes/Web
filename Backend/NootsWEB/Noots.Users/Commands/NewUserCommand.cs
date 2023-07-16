using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Users.Commands
{
    public class NewUserCommand : BaseCommandEntity, IRequest<OperationResult<Guid>>
    {
        public string Name { set; get; }

        public string Email { set; get; }

        public string PhotoURL { set; get; }

        public NewUserCommand(string name, string email, string photoURL)
        {
            Name = name;
            Email = email;
            PhotoURL = photoURL;
        }
    }
}
