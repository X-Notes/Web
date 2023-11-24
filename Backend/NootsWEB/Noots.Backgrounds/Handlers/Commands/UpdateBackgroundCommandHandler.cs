using Backgrounds.Commands;
using MediatR;
using Noots.DatabaseContext.Repositories.Users;

namespace Backgrounds.Handlers.Commands;

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