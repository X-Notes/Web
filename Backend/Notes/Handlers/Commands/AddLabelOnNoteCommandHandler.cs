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

public class AddLabelOnNoteCommandHandler(IMediator mediator,
        LabelsNotesRepository labelsNotesRepository,
        NoteRepository noteRepository,
        HistoryCacheService historyCacheService)
    : IRequestHandler<AddLabelOnNoteCommand, OperationResult<List<VersionUpdateResult>>>
{
    public async Task<OperationResult<List<VersionUpdateResult>>> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var isAuthor = permissions.All(x => x.perm.IsOwner);
        if (!isAuthor)
        {
            return new OperationResult<List<VersionUpdateResult>>().SetNoPermissions();
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
        
        var results = notes.Select(x => new VersionUpdateResult(x.Id, x.Version)).ToList();
        return new OperationResult<List<VersionUpdateResult>>(true, results);
    }
}