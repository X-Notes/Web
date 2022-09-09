using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.Users;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.Encryption.Impl;
using Noots.History.Entities;
using Noots.History.Queries;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.History.Handlers.Queries;

public class GetNoteHistoriesQueryHandler : IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>
{
    private readonly IMediator mediator;
    private readonly UserNoteEncryptService userNoteEncryptStorage;
    private readonly NoteSnapshotRepository noteHistoryRepository;
    private readonly NoteFolderLabelMapper noteCustomMapper;
    private readonly BillingPermissionService billingPermissionService;

    public GetNoteHistoriesQueryHandler(
        IMediator mediator, 
        UserNoteEncryptService userNoteEncryptStorage,
        NoteSnapshotRepository noteHistoryRepository,
        NoteFolderLabelMapper noteCustomMapper,
        BillingPermissionService billingPermissionService)
    {
        this.mediator = mediator;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
        this.noteHistoryRepository = noteHistoryRepository;
        this.noteCustomMapper = noteCustomMapper;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<List<NoteHistoryDTO>>> Handle(GetNoteHistoriesQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.Note.IsLocked)
        {
            var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
            if (!isUnlocked)
            {
                return new OperationResult<List<NoteHistoryDTO>>(false, null).SetContentLocked();
            }
        }

        if (permissions.CanRead)
        {
            var snapshots = await GetNoteSnapshotsAsync(request.UserId, request.NoteId);
            var data = MapHistoriesToHistoriesDto(snapshots);
            return new OperationResult<List<NoteHistoryDTO>>(true, data);
        }

        return new OperationResult<List<NoteHistoryDTO>>(false, null).SetNoPermissions();
    }

    private async Task<List<NoteSnapshot>> GetNoteSnapshotsAsync(Guid userId, Guid noteId)
    {
        var isPremium = await billingPermissionService.IsUserPlanPremiumAsync(userId);
        if (!isPremium)
        {
            return await noteHistoryRepository.GetNoteHistories(noteId, HistoryBillingConstraints.maxSnapshotForNoPremiumUser);
        }
        return await noteHistoryRepository.GetNoteHistories(noteId);
    }
    
    private List<NoteHistoryDTO> MapHistoriesToHistoriesDto(IEnumerable<NoteSnapshot> histories)
    {
        return histories.Select(x => MapHistoryToHistoryDto(x)).ToList();
    }
    
    private NoteHistoryDTO MapHistoryToHistoryDto(NoteSnapshot historyDTO)
    {
        return new NoteHistoryDTO()
        {
            SnapshotTime = historyDTO.SnapshotTime,
            Users = MapUsersToUsersNoteHistory(historyDTO.Users),
            NoteVersionId = historyDTO.Id
        };
    }
    
    private List<UserNoteHistory> MapUsersToUsersNoteHistory(IEnumerable<User> users)
    {
        return users.Select(x => MapUserToUserNoteHistory(x)).ToList();
    }
    
    private UserNoteHistory MapUserToUserNoteHistory(User user)
    {
        var path = this.noteCustomMapper.BuildFilePath(user.Id, user.UserProfilePhoto?.AppFile.GetFromSmallPath);
        return new UserNoteHistory()
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            PhotoId = user.UserProfilePhoto?.AppFileId,
            PhotoPath = path ?? user.DefaultPhotoUrl
        };
    }
}