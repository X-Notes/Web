using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using MediatR;

namespace Users.Commands
{
    public class UpdateMainUserInfoCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
    }
}
