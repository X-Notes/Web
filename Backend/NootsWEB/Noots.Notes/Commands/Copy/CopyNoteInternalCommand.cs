using Common.DTO;
using Common.DTO.Notes.Copy;
using MediatR;
using Noots.Notes.Entities;

namespace Noots.Notes.Commands.Copy;

public class CopyNoteInternalCommand : IRequest<OperationResult<CopyNoteResult>>
{
    public Guid NoteId { set; get; }

    public Guid UserId { set; get; }

    public Guid? FolderId { set; get; }

    public CopyNoteInternalCommand(Guid noteId, Guid userId, Guid? folderId = null)
    {
        NoteId = noteId;
        UserId = userId;
        FolderId = folderId;
    }
}
