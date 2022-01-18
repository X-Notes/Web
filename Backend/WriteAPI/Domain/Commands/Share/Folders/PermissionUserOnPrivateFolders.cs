using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }
        [ValidationGuid]
        public Guid UserId { set; get; }

        [RequiredEnumField(ErrorMessage = "Access type id is required.")]
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
