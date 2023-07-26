using Common.DTO.Users;
using MediatR;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Mapper.Mapping;
using Noots.Notes.Queries;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.Editor.Services.Users;

public class GetOnlineUsersOnNoteQueryHandler : IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>
{
    private readonly INoteServiceStorage WSNoteServiceStorage;
    private readonly UserRepository userRepository;
    private readonly IMediator mediator;
    private readonly UserBackgroundMapper userBackgroundMapper;

    public GetOnlineUsersOnNoteQueryHandler(
        INoteServiceStorage WSNoteServiceStorage,
        UserRepository userRepository,
        IMediator mediator,
        UserBackgroundMapper userBackgroundMapper)
    {
        this.WSNoteServiceStorage = WSNoteServiceStorage;
        this.userRepository = userRepository;
        this.mediator = mediator;
        this.userBackgroundMapper = userBackgroundMapper;
    }

    public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNoteQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.NoteNotFound)
        {
            return new List<OnlineUserOnNote>();
        }

        if (permissions.CanRead)
        {
            var recognizedUsers = await WSNoteServiceStorage.GetEntitiesIdAsync(request.Id);

            var dict = recognizedUsers.ToLookup(x => x.UserId);
            var ids = recognizedUsers.Select(x => x.UserId).ToList();
            var users = await userRepository.GetUsersWithPhotos(ids);

            var dbUsers = users.Select(x =>
            {
                var identityIds = dict[x.Id].Select(x => x.Id).ToList();
                return userBackgroundMapper.MapToOnlineUserOnNote(x, identityIds);
            });

            return dbUsers.ToList();
        }

        return new List<OnlineUserOnNote>();
    }
}