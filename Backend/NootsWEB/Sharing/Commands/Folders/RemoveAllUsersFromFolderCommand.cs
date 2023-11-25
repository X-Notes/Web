using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Sharing.Commands.Folders
{
    public class RemoveAllUsersFromFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }
    }
}
