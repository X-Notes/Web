using System;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class RemoveUserFromPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid NoteId { set; get; }
        [Required]
        public Guid UserId { set; get; }
    }
}
