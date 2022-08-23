using Common.Attributes;
using Common.CQRS;
using Common.DTO.Folders;
using MediatR;

namespace Noots.Folders.Commands
{
    public class CopyFolderCommand : BaseCommandEntity, IRequest<List<SmallFolder>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public CopyFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
