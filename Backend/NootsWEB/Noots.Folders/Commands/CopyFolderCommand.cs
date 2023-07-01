using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Folders.Entities;

namespace Noots.Folders.Commands
{
    public class CopyFolderCommand : BaseCommandEntity, IRequest<OperationResult<CopyFoldersResult>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public CopyFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
