using Common;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Commands;

namespace Noots.Labels.Handlers.Commands;

public class SetDeletedLabelCommandHandler : IRequestHandler<SetDeletedLabelCommand, Unit>
{
    private readonly LabelRepository labelRepository;
    
    public SetDeletedLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Unit> Handle(SetDeletedLabelCommand request, CancellationToken cancellationToken)
    {
        var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
        if (label != null)
        {
            label.ToType(true, DateTimeProvider.Time);
            await labelRepository.UpdateAsync(label);
        }
        return Unit.Value;
    }
}