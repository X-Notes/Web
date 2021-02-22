using Common.DatabaseModels.models;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.share.notes
{
    public class PermissionUserOnPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid NoteId { set; get; }
        [Required]
        public Guid UserId { set; get; }
        [Required]
        public Guid AccessTypeId { set; get; }
    }
}
