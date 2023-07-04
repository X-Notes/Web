using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notes.Commands;
using Noots.Permissions.Queries;

namespace Noots.Notes.Handlers.Commands;

public class ArchiveNoteCommandHandler : IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;

    public ArchiveNoteCommandHandler(IMediator _mediator, NoteRepository noteRepository)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var notes = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Note).ToList();
        if (notes.Any())
        {
            notes.ForEach(x =>
            {
                x.ToType(NoteTypeENUM.Archived);
                x.SetDateAndVersion();
            });
            await noteRepository.UpdateRangeAsync(notes);
            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}