using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using Editor.Entities;
using MediatR;

namespace Editor.Commands.Text
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
