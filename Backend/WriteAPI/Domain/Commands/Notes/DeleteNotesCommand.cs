using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Notes
{
    public class DeleteNotesCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public DeleteNotesCommand(string email): base(email)
        {

        }
    }
}
