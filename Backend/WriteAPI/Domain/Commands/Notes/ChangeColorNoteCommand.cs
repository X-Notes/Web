using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Notes
{
    public class ChangeColorNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Color { set; get; }
        [Required]
        public List<Guid> Ids { set; get; }
        public ChangeColorNoteCommand(List<Guid> ids, string email, string color)
            :base(email)
        {
            this.Ids = ids;
            Color = color;
        }
    }
}
