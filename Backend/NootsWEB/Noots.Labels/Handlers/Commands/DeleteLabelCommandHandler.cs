﻿using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Commands;

namespace Noots.Labels.Handlers.Commands;

public class DeleteLabelCommandHandler : IRequestHandler<DeleteLabelCommand, Unit>
{
    private readonly LabelRepository labelRepository;
    
    public DeleteLabelCommandHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<Unit> Handle(DeleteLabelCommand request, CancellationToken cancellationToken)
    {
        var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
        if (label != null)
        {
            await labelRepository.RemoveAsync(label);
        }
        return Unit.Value;
    }
}