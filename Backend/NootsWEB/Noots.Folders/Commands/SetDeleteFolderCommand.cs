using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Folders.Commands
{
    public class SetDeleteFolderCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }


        public SetDeleteFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
