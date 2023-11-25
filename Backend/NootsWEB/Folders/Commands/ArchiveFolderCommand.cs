using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Folders.Commands
{
    public class ArchiveFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public ArchiveFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
