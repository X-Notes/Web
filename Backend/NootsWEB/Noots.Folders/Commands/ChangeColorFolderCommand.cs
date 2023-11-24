using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Folders.Commands
{
    public class ChangeColorFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public string Color { set; get; }

        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public string ConnectionId { set; get; }

        public ChangeColorFolderCommand(List<Guid> ids, Guid userId, string color, string connectionId)
            : base(userId)
        {
            this.Ids = ids;
            Color = color;
            ConnectionId = connectionId;
        }
    }
}
