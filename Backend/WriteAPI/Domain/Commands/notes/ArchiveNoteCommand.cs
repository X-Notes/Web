using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
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
