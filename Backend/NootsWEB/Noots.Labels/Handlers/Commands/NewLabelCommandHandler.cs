using Common;
using Common.DatabaseModels.Models.Labels;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Commands;

namespace Noots.Labels.Handlers.Commands;

public class NewLabelCommandHandler : IRequestHandler<NewLabelCommand, Guid>
{
    private readonly LabelRepository labelRepository;
    
    public NewLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Guid> Handle(NewLabelCommand request, CancellationToken cancellationToken)
    {
        var label = new Label();
        label.UserId = request.UserId;
        label.Color = LabelsColorPallete.Red;
        label.CreatedAt = DateTimeProvider.Time;
        label.UpdatedAt = DateTimeProvider.Time;
        
        await labelRepository.AddAsync(label);
        
        return label.Id;
    }
}