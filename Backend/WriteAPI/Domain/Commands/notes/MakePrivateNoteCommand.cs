using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
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
