using DatabaseContext.Repositories.Labels;
using Labels.Commands;
using MediatR;

namespace Labels.Handlers.Commands;

public class RemoveAllFromBinCommandHandler(LabelRepository labelRepository) : IRequestHandler<RemoveAllFromBinCommand, Unit>
{
    public async Task<Unit> Handle(RemoveAllFromBinCommand request, CancellationToken cancellationToken)
    {
        await labelRepository.ExecuteDeleteAsync(x => x.UserId == request.UserId && x.IsDeleted == true);
        return Unit.Value;
    }
}