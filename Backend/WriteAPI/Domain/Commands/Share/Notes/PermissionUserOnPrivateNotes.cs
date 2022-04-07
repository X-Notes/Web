using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class PermissionUserOnPrivateNotes : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid PermissionUserId { set; get; }

        [RequiredEnumField(ErrorMessage = "Access type id is required.")]
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
