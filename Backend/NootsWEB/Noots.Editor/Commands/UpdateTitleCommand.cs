using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Editor.Commands
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public List<List<object>> Diffs { set; get; }

        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}
