using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notes.Commands;

namespace Noots.Notes.Handlers.Commands;

public class UpdatePositionsNotesCommandHandler : IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>
{
    private readonly NoteRepository noteRepository;

    public UpdatePositionsNotesCommandHandler(NoteRepository noteRepository)
    {
        this.noteRepository = noteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(UpdatePositionsNotesCommand request, CancellationToken cancellationToken)
    {
        var noteIds = request.Positions.Select(x => x.EntityId).ToList();
        var notes = await noteRepository.GetWhereAsync(x => x.UserId == request.UserId && noteIds.Contains(x.Id));

        if (notes.Any())
        {
            request.Positions.ForEach(x =>
            {
                var note = notes.FirstOrDefault(q => q.Id == x.EntityId);
                if (note != null)
                {
                    note.Order = x.Position;
                }
            });

            await noteRepository.UpdateRangeAsync(notes);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}