using Common;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notes.Commands;
using Noots.Permissions.Queries;

namespace Noots.Notes.Handlers.Commands;

public class SetDeleteNoteCommandHandler : IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

    public SetDeleteNoteCommandHandler(
        IMediator _mediator, 
        NoteRepository noteRepository,
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
    }
    
    public async Task<OperationResult<List<Guid>>> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var processedIds = new List<Guid>();

        var notesOwner = permissions.Where(x => !x.perm.NoteNotFound && x.perm.IsOwner).Select(x => x.perm.Note).ToList();
        if (notesOwner.Any())
        {
            notesOwner.ForEach(x =>
            {
                x.ToType(NoteTypeENUM.Deleted, DateTimeProvider.Time);
                x.SetDateAndVersion();
            });
            await noteRepository.UpdateRangeAsync(notesOwner);
            processedIds = notesOwner.Select(x => x.Id).ToList();
        }

        var usersOnPrivate = await usersOnPrivateNotesRepository.GetWhereAsync(x => request.UserId == x.UserId && request.Ids.Contains(x.NoteId));
        if (usersOnPrivate.Any())
        {
            await usersOnPrivateNotesRepository.RemoveRangeAsync(usersOnPrivate);
        }

        return new OperationResult<List<Guid>>(true, processedIds);
    }
}