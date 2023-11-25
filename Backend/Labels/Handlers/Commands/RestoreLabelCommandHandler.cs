using DatabaseContext.Repositories.Labels;
using Labels.Commands;
using MediatR;

namespace Labels.Handlers.Commands;

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