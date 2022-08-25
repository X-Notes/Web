using Common.DatabaseModels.Models.History;
using Common.DTO;
using Common.DTO.Labels;
using MediatR;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.Encryption.Impl;
using Noots.History.Entities;
using Noots.History.Queries;
using Noots.Permissions.Queries;

namespace Noots.History.Handlers.Queries;

public class GetNoteSnapshotQueryHandler : IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>
{
    private readonly IMediator mediator;
    private readonly UserNoteEncryptService userNoteEncryptStorage;
    private readonly NoteSnapshotRepository noteHistoryRepository;

    public GetNoteSnapshotQueryHandler(
        IMediator mediator, 
        UserNoteEncryptService userNoteEncryptStorage,
        NoteSnapshotRepository noteHistoryRepository)
    {
        this.mediator = mediator;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
        this.noteHistoryRepository = noteHistoryRepository;
    }
    
    public async Task<OperationResult<NoteHistoryDTOAnswer>> Handle(GetNoteSnapshotQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.Note.IsLocked)
        {
            var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
            if (!isUnlocked)
            {
                return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetContentLocked();
            }
        }

        if (permissions.CanRead)
        {
            var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
            var data = new NoteHistoryDTOAnswer(true, MapNoteSnapshotToNoteSnapshotDTO(snapshot));
            return new OperationResult<NoteHistoryDTOAnswer>(true, data);
        }

        return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetNoPermissions();
    }
    
    private NoteSnapshotDTO MapNoteSnapshotToNoteSnapshotDTO(NoteSnapshot snapshot)
    {
        return new NoteSnapshotDTO()
        {
            Id = snapshot.Id,
            Color = snapshot.Color,
            SnapshotTime = snapshot.SnapshotTime,
            Labels = snapshot.Labels.Select(x => new LabelDTO { Name = x.Name, Color = x.Color }).ToList(),
            NoteId = snapshot.NoteId,
            NoteTypeId = snapshot.NoteTypeId,
            RefTypeId = snapshot.RefTypeId,
            Title = snapshot.Title
        };
    }
}