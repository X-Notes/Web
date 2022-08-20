using MediatR;
using Noots.Backgrounds.Commands;
using WriteContext.Repositories.Users;

namespace Noots.Backgrounds.Handlers.Commands;

public class UpdateBackgroundCommandHandler : IRequestHandler<UpdateBackgroundCommand, Unit>
{
    private readonly UserRepository userRepository;

    public UpdateBackgroundCommandHandler(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }
    
    public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
        user.CurrentBackgroundId = request.Id;
        await userRepository.UpdateAsync(user);
        return Unit.Value;
    }
}