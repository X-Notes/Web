using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DTO;
using Common.DTO.WebSockets;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Impl;
using Notes.Commands;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Notes.Handlers.Commands;

public class AddLabelOnNoteCommandHandler : IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly HistoryCacheService historyCacheService;
    private readonly LabelRepository labelRepository;
    private readonly NoteWSUpdateService noteWSUpdateService;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public AddLabelOnNoteCommandHandler(
        IMediator _mediator, 
        LabelsNotesRepository labelsNotesRepository,
        NoteRepository noteRepository,
        HistoryCacheService historyCacheService,
        LabelRepository labelRepository,
        NoteWSUpdateService noteWSUpdateService,
        NoteFolderLabelMapper appCustomMapper)
    {
        mediator = _mediator;
        this.labelsNotesRepository = labelsNotesRepository;
        this.noteRepository = noteRepository;
        this.historyCacheService = historyCacheService;
        this.labelRepository = labelRepository;
        this.noteWSUpdateService = noteWSUpdateService;
        this.appCustomMapper = appCustomMapper;
    }
    
    public async Task<OperationResult<Unit>> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var isAuthor = permissions.All(x => x.perm.IsOwner);
        if (isAuthor)
        {
            var noteIds = permissions.Select(x => x.noteId);
            var notes = permissions.Select(x => x.perm.Note).ToList();
            var existValues = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));
            var noteIdsWithLabel = existValues.Select(x => x.NoteId);

            var labelsToAdd = request.NoteIds.Select(id => new LabelsNotes() { LabelId = request.LabelId, NoteId = id, AddedAt = DateTimeProvider.Time });
            labelsToAdd = labelsToAdd.Where(x => !noteIdsWithLabel.Contains(x.NoteId));

            if (labelsToAdd.Any())
            {
                await labelsNotesRepository.AddRangeAsync(labelsToAdd);

                notes.ForEach(x => x.SetDateAndVersion());
                await noteRepository.UpdateRangeAsync(notes);

                foreach(var perm in permissions)
                {
                    await historyCacheService.UpdateNoteAsync(perm.perm.Note.Id, perm.perm.Caller.Id);
                }

                // WS UPDATES
                var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.LabelId);
                var labels = appCustomMapper.MapLabelsToLabelsDTO(new List<Label> { label });
                foreach (var labelNote in labelsToAdd) {
                    var value = permissions.FirstOrDefault(x => x.noteId == labelNote.NoteId);
                    if (value.perm != null) {
                        var update = new UpdateNoteWS { AddLabels = labels, NoteId = value.noteId };
                        await noteWSUpdateService.UpdateNoteWithConnections(update, value.perm.GetAllUsers(), request.ConnectionId);
                    }
                }
            }
            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}