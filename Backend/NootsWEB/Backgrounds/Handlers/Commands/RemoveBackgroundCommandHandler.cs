using Backgrounds.Commands;
using DatabaseContext.Repositories.Users;
using MediatR;
using Storage.Commands;

namespace Backgrounds.Handlers.Commands;

public class RemoveBackgroundCommandHandler : IRequestHandler<RemoveBackgroundCommand, Unit>
{
    private readonly UserRepository userRepository;
    private readonly IMediator mediator;
    private readonly BackgroundRepository backgroundRepository;

    public RemoveBackgroundCommandHandler(
        UserRepository userRepository,
        IMediator mediator,
        BackgroundRepository backgroundRepository)
    {
        this.userRepository = userRepository;
        this.mediator = mediator;
        this.backgroundRepository = backgroundRepository;
    }
    
    public async Task<Unit> Handle(RemoveBackgroundCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetUserWithBackgrounds(request.UserId);
        var back = user.Backgrounds.FirstOrDefault(x => x.Id == request.Id);
        if (back != null)
        {
            await backgroundRepository.RemoveAsync(back);
            await mediator.Send(new RemoveFilesCommand(user.Id.ToString(), back.File));
        }
        return Unit.Value;
    }
}