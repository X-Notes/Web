using Common.Attributes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Systems;
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

        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }

        [Required]
        public bool SendMessage { set; get; }

        public string Message { set; get; }
    }
}
