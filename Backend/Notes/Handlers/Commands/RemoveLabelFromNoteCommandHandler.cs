using Common.DTO;
using DatabaseContext.Repositories.Labels;
using DatabaseContext.Repositories.Notes;
using History.Impl;
using MediatR;
using Notes.Commands;
using Permissions.Queries;

namespace Notes.Handlers.Commands;

public class RemoveLabelFromNoteCommandHandler : IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly HistoryCacheService historyCacheService;

    public RemoveLabelFromNoteCommandHandler(
        IMediator mediator, 
        LabelsNotesRepository labelsNotesRepository,
        NoteRepository noteRepository,
        HistoryCacheService historyCacheService)
    {
        this.mediator = mediator;
        this.labelsNotesRepository = labelsNotesRepository;
        this.noteRepository = noteRepository;
        this.historyCacheService = historyCacheService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command, cancellationToken);

        var isAuthor = permissions.All(x => x.perm.IsOwner);
        if (!isAuthor)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
        var noteIds = permissions.Select(x => x.noteId);
        var notes = await noteRepository.GetWhereAsync(x => noteIds.Contains(x.Id));
        
        var values = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));

        if (values.Any())
        {
            await labelsNotesRepository.RemoveRangeAsync(values);

            notes.ForEach(x => x.SetDateAndVersion());
            await noteRepository.UpdateRangeAsync(notes);

            foreach (var perm in permissions)
            {
                await historyCacheService.UpdateNoteAsync(perm.perm.NoteId, perm.perm.CallerId);
            }
        }
        
        return new OperationResult<Unit>(true, Unit.Value);
    }
}