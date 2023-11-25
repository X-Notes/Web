using Backgrounds.Commands;
using DatabaseContext.Repositories.Users;
using MediatR;

namespace Backgrounds.Handlers.Commands;

public class DefaultBackgroundCommandHandler : IRequestHandler<DefaultBackgroundCommand, Unit>
{
    private readonly UserRepository userRepository;

    public DefaultBackgroundCommandHandler(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }
    
    public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
        user.CurrentBackgroundId = null;
        await userRepository.UpdateAsync(user);
        return Unit.Value;
    }
}