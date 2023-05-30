using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Editor.Commands
{
    public class BaseTransformToCommand<T> : BaseCommandEntity, IRequest<OperationResult<T>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public BaseTransformToCommand(Guid noteId, Guid contentId)
        {
            NoteId = noteId;
            ContentId = contentId;
        }
    }
}
