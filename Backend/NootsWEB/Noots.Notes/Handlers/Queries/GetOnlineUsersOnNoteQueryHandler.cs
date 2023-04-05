using Common.DTO.Users;
using MediatR;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Encryption.Impl;
using Noots.Mapper.Mapping;
using Noots.Notes.Queries;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl.NoteFolderStates.DBStorage;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.Notes.Handlers.Queries;

public class GetOnlineUsersOnNoteQueryHandler : IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>
{
    private readonly INoteServiceStorage WSNoteServiceStorage;
    private readonly UserRepository userRepository;
    private readonly IMediator mediator;
    private readonly UserBackgroundMapper userBackgroundMapper;
    private readonly UserNoteEncryptService userNoteEncryptStorage;

    public GetOnlineUsersOnNoteQueryHandler(
        INoteServiceStorage WSNoteServiceStorage,
        UserRepository userRepository,
        IMediator mediator,
        UserBackgroundMapper userBackgroundMapper,
        UserNoteEncryptService userNoteEncryptStorage)
    {
        this.WSNoteServiceStorage = WSNoteServiceStorage;
        this.userRepository = userRepository;
        this.mediator = mediator;
        this.userBackgroundMapper = userBackgroundMapper;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
    }
    
    public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNoteQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.NoteNotFound)
        {
            return new List<OnlineUserOnNote>();
        }

        if (permissions.Note.IsLocked)
        {
            var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
            if (!isUnlocked)
            {
                return new List<OnlineUserOnNote>();
            }
        }

        if (permissions.CanRead)
        {
            var ents = await WSNoteServiceStorage.GetEntitiesIdAsync(request.Id);
            var unrecognizedUsers = ents.Where(x => !x.UserId.HasValue).Select(x => userBackgroundMapper.MapToOnlineUserOnNote(x));
            var recognizedUsers = ents.Where(x => x.UserId.HasValue).ToList();

            var dict = recognizedUsers.ToLookup(x => x.UserId);
            var ids = recognizedUsers.Select(x => x.UserId.Value).ToList();
            var users = await userRepository.GetUsersWithPhotos(ids);

            var dbUsers = users.Select(x =>
            {
                var identityIds = dict[x.Id].Select(x => x.Id).ToList();
                return userBackgroundMapper.MapToOnlineUserOnNote(x, identityIds);
            });

            return dbUsers.Concat(unrecognizedUsers).ToList();
        }

        return new List<OnlineUserOnNote>();
    }
}