using Common;
using DatabaseContext.Repositories.Labels;
using Labels.Commands;
using MediatR;

namespace Labels.Handlers.Commands;

public class UpdateLabelCommandHandler : IRequestHandler<UpdateLabelCommand, Unit>
{
    private readonly LabelRepository labelRepository;
    
    public UpdateLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Unit> Handle(UpdateLabelCommand request, CancellationToken cancellationToken)
    {
        var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
        if (label != null)
        {
            label.Color = request.Color;
            label.Name = request.Name;
            label.UpdatedAt = DateTimeProvider.Time;
            await labelRepository.UpdateAsync(label);
        }
        return Unit.Value;
    }
}