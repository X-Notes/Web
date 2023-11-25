using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using MediatR;

namespace Editor.Commands.Structure;

public class SyncNoteStructureCommand : BaseCommandEntity, IRequest<OperationResult<NoteStructureResult>>
{
    [Required]
    public DiffsChanges Diffs { set; get; }

    [ValidationGuid]
    public Guid NoteId { set; get; }

    public string ConnectionId { set; get; }
}
