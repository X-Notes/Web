using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Folders.Commands
{
    public class DeleteFoldersCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public DeleteFoldersCommand(Guid userId) : base(userId)
        {

        }
    }
}
