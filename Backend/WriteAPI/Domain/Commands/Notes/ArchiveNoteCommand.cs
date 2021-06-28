using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Notes
{
    public class ArchiveNoteCommand : BaseCommandEntity, IRequest<Unit> 
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public ArchiveNoteCommand(string email) : base(email)
        {

        }
    }
}
