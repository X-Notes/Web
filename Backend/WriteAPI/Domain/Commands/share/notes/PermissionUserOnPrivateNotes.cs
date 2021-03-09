using Common.Attributes;
using Common.DatabaseModels.models;
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
        [ValidationGuidAttribute]
        public Guid AccessTypeId { set; get; }
    }
}
