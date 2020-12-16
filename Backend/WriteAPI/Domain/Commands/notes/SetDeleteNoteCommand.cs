using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }
        public SetDeleteNoteCommand(string email, List<Guid> ids) : base(email)
        {
            Ids = ids;
        }
    }
}
