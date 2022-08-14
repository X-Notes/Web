using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using MediatR;

namespace Noots.Users.Commands
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Guid>
    {
        [Required]
        public string Name { set; get; }

        public string Email { set; get; }

        public string PhotoURL { set; get; }
    }
}
