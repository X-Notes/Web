using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DTO;
using DatabaseContext.Repositories.Labels;
using DatabaseContext.Repositories.Notes;
using History.Impl;
using MediatR;
using Notes.Commands;
using Permissions.Queries;

namespace Notes.Handlers.Commands;

public class AddLabelOnNoteCommandHandler : IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly HistoryCacheService historyCacheService;

    public AddLabelOnNoteCommandHandler(
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
    
    public async Task<OperationResult<Unit>> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var isAuthor = permissions.All(x => x.perm.IsOwner);
        if (!isAuthor)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
        var noteIds = permissions.Select(x => x.noteId);
        var notes = await noteRepository.GetWhereAsync(x => noteIds.Contains(x.Id));
        var existValues = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));
        var noteIdsWithLabel = existValues.Select(x => x.NoteId);

        var labelsToAdd = request.NoteIds.Select(id => new LabelsNotes() { LabelId = request.LabelId, NoteId = id, AddedAt = DateTimeProvider.Time });
        labelsToAdd = labelsToAdd.Where(x => !noteIdsWithLabel.Contains(x.NoteId)).ToList();

        if (labelsToAdd.Any())
        {
            await labelsNotesRepository.AddRangeAsync(labelsToAdd);

            notes.ForEach(x => x.SetDateAndVersion());
            await noteRepository.UpdateRangeAsync(notes);

            foreach(var perm in permissions)
            {
                await historyCacheService.UpdateNoteAsync(perm.perm.NoteId, perm.perm.CallerId);
            }
        }
        
        return new OperationResult<Unit>(true, Unit.Value);
    }
}