using MediatR;
using System.ComponentModel.DataAnnotations;


namespace Domain.Commands.users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
    }
}
