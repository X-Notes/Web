using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Commands;

namespace Noots.Labels.Handlers.Commands;

public class RestoreLabelCommandHandler :  IRequestHandler<RestoreLabelCommand, Unit>
{
    private readonly LabelRepository labelRepository; 
    
    public RestoreLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Unit> Handle(RestoreLabelCommand request, CancellationToken cancellationToken)
    {
        var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
        if (label != null)
        {
            label.ToType(false);
            await labelRepository.UpdateAsync(label);
        }
        return Unit.Value;
    }
}