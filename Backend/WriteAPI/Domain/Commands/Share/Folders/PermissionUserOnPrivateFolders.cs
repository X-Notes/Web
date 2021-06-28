using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }
        [ValidationGuid]
        public Guid UserId { set; get; }

        [RequiredEnumField(ErrorMessage = "Access type id is required.")]
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
