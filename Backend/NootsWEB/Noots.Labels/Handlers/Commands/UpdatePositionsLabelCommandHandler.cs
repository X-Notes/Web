using Common.DTO;
using Labels.Commands;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;

namespace Labels.Handlers.Commands;

public class UpdatePositionsLabelCommandHandler : IRequestHandler<UpdatePositionsLabelCommand, OperationResult<Unit>>
{
    private readonly LabelRepository labelRepository;
    
    public UpdatePositionsLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(UpdatePositionsLabelCommand request, CancellationToken cancellationToken)
    {
        var labelIds = request.Positions.Select(x => x.EntityId).ToList();
        var labels = await labelRepository.GetWhereAsync(x => x.UserId == request.UserId && labelIds.Contains(x.Id));
        if (labels.Any())
        {
            request.Positions.ForEach(x =>
            {
                var label = labels.FirstOrDefault(z => z.Id == x.EntityId);
                if (label != null)
                {
                    label.Order = x.Position;
                }
            });

            await labelRepository.UpdateRangeAsync(labels);

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNotFound();
    }
}