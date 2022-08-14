using System;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class RemoveUserFromPrivateFolders : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        [ValidationGuid]
        public Guid PermissionUserId { set; get; }
    }
}
