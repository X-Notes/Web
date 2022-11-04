using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Editor.Entities.EditorStructure;
using System.ComponentModel.DataAnnotations;

namespace Noots.Editor.Commands
{
    public class SyncStructureCommand : BaseCommandEntity, IRequest<OperationResult<NoteStructureResult>>
    {
        [Required]
        public DiffsChanges Diffs { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }
    }
}
