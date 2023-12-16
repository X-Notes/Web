using Common;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notes.Commands;
using Permissions.Queries;
using Permissions.Services;

namespace Notes.Handlers.Commands;

public class SetDeleteNoteCommandHandler : IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;

    public SetDeleteNoteCommandHandler(
        IMediator _mediator, 
        NoteRepository noteRepository,
        UsersOnPrivateNotesService usersOnPrivateNotesService)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
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

        await usersOnPrivateNotesService.RevokePermissionsNotes(request.UserId, request.Ids);

        return new OperationResult<List<Guid>>(true, processedIds);
    }
}