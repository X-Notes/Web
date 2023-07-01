using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using MediatR;
using Noots.Notes.Entities;

namespace Noots.Notes.Commands;

public class CopyFolderNotesCommand : BaseCommandEntity, IRequest<OperationResult<List<CopyNoteResult>>>
{
    [RequiredListNotEmpty]
    public List<Guid> Ids { set; get; }

    public User Caller { set; get; }

    public CopyFolderNotesCommand(Guid userId, User caller, List<Guid> ids) : base(userId)
    {
        Caller = caller;
        Ids = ids;
    }
}
