using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Sharing.Commands.Folders
{
    public class RemoveUserFromPrivateFolders : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        [ValidationGuid]
        public Guid PermissionUserId { set; get; }
    }
}
