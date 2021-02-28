using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.notes
{
    public class RemoveUserFromPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid NoteId { set; get; }
        [Required]
        public Guid UserId { set; get; }
    }
}
