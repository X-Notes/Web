using Common.CQRS;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;

namespace Folders.Commands
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<OperationResult<SmallFolder>>
    {
        public NewFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
