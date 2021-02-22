using Common.DatabaseModels.models;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.notes
{
    public class SendInvitesToUsersNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> UserIds { set; get; }
        [Required]
        public Guid NoteId { set; get; }
        [Required]
        public Guid RefTypeId { set; get; }
        [Required]
        public bool SendMessage { set; get; }
        public string Message { set; get; }
    }
}
