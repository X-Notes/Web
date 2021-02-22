using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public List<Guid> Ids { set; get; }


        [Required]
        public Guid ToId { set; get; }

        public CopyNoteCommand(string email) : base(email)
        {

        }
    }
}
