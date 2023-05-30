using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Editor.Entities;

namespace Noots.Editor.Commands
{
    public class BaseUpdateCollectionInfo : BaseCommandEntity, IRequest<OperationResult<UpdateBaseContentResult>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public string Name { set; get; }

        public BaseUpdateCollectionInfo(Guid noteId, Guid contentId, string name)
        {
            NoteId = noteId;
            ContentId = contentId;
            Name = name;
        }
    }
}
