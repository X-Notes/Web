using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Editor.Entities.Text;

namespace Noots.Editor.Commands
{
    public class UpdateTextContentsCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [RequiredListNotEmpty]
        public List<TextDiff> Updates { set; get; } = new List<TextDiff>();
    }
}
