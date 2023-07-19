using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Editor.Commands.Title
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }

        public string ConnectionId { set; get; }
    }
}
