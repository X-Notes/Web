using Common.DatabaseModels.helpers;
using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public List<string> Ids { set; get; }
        public CopyNoteCommand(string email) : base(email)
        {

        }
    }
}
