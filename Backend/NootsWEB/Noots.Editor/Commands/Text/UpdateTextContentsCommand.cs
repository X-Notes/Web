using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using MediatR;
using Noots.Editor.Entities;

namespace Noots.Editor.Commands.Text
{
    public class UpdateTextContentsCommand : BaseCommandEntity, IRequest<OperationResult<List<UpdateBaseContentResult>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [RequiredListNotEmpty]
        public List<TextDiff> Texts { set; get; } = new List<TextDiff>();

        public string ConnectionId { set; get; }
    }
}
