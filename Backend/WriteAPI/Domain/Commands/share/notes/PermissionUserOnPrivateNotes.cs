using Common.Attributes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.share.notes
{
    public class PermissionUserOnPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid UserId { set; get; }

        [RequiredEnumField(ErrorMessage = "Access type id is required.")]
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
