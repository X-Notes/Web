using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
    }
}
