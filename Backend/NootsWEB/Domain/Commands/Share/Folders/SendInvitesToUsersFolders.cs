using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class SendInvitesToUsersFolders : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> UserIds { set; get; }

        [ValidationGuid]
        public Guid FolderId { set; get; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }

        [Required]
        public bool SendMessage { set; get; }

        public string Message { set; get; }
    }
}
