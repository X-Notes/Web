using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
{
    public class MakePrivateNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }


        [Required]
        public Guid ToId { set; get; }

        public MakePrivateNoteCommand(string email) : base(email)
        {

        }
    }
}
