using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.users
{
    public class UpdateLanguageCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid Id { set; get; }

        public UpdateLanguageCommand(Guid Id, string Email)
            :base(Email)
        {
            this.Id = Id;
        }
    }
}
