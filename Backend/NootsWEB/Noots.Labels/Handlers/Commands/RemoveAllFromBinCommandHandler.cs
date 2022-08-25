﻿using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Commands;

namespace Noots.Labels.Handlers.Commands;

public class RemoveAllFromBinCommandHandler : IRequestHandler<RemoveAllFromBinCommand, Unit>
{
    private readonly LabelRepository labelRepository;
    
    public RemoveAllFromBinCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Unit> Handle(RemoveAllFromBinCommand request, CancellationToken cancellationToken)
    {
        var labels = await labelRepository.GetWhereAsync(x => x.UserId == request.UserId && x.IsDeleted == true);
        if (labels.Any())
        {
            await labelRepository.RemoveRangeAsync(labels);
        }
        return Unit.Value;
    }
}