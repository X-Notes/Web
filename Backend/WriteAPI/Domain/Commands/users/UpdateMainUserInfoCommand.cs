using MediatR;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.users
{
    public class UpdateMainUserInfoCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
    }
}
