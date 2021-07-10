using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Notes
{
    public class MakePrivateNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public MakePrivateNoteCommand(string email) : base(email)
        {

        }
    }
}
