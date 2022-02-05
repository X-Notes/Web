using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class ChangeColorNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public string Color { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public ChangeColorNoteCommand(List<Guid> ids, string email, string color)
            :base(email)
        {
            this.Ids = ids;
            Color = color;
        }
    }
}
