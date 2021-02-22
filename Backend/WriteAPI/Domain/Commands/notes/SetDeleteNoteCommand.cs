using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        [Required]
        public Guid ToId { set; get; }
        public SetDeleteNoteCommand(string email, List<Guid> ids) : base(email)
        {
            Ids = ids;
        }
    }
}
