using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class PermissionUserOnPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid UserId { set; get; }

        [RequiredEnumField(ErrorMessage = "Access type id is required.")]
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
