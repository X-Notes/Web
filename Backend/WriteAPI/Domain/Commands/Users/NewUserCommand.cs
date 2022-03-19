using System;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Guid>
    {
        [Required]
        public string Name { set; get; }

        public string Email { set; get; }

        public string PhotoURL { set; get; }
    }
}
