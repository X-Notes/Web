using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
{
    public class DeleteNotesCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<string> Ids { set; get; }
        public DeleteNotesCommand(string email): base(email)
        {

        }
    }
}
