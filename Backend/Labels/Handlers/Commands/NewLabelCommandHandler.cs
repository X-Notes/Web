using Billing.Impl;
using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DTO;
using DatabaseContext.Repositories.Labels;
using Labels.Commands;
using MediatR;

namespace Labels.Handlers.Commands;

public class NewLabelCommandHandler : IRequestHandler<NewLabelCommand, OperationResult<Guid>>
{
    private readonly LabelRepository labelRepository;
    private readonly BillingPermissionService billingPermissionService;

    public NewLabelCommandHandler(LabelRepository labelRepository, BillingPermissionService billingPermissionService)
    {
        this.labelRepository = labelRepository;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<Guid>> Handle(NewLabelCommand request, CancellationToken cancellationToken)
    {
        var isCanCreate = await billingPermissionService.CanCreateLabelAsync(request.UserId);
        if (!isCanCreate)
        {
            return new OperationResult<Guid>().SetBillingError();
        }
        
        var label = new Label();
        label.UserId = request.UserId;
        label.Color = LabelsColorPallete.Red;
        label.CreatedAt = DateTimeProvider.Time;
        label.UpdatedAt = DateTimeProvider.Time;
        
        await labelRepository.AddAsync(label);
        
        return new OperationResult<Guid>(true, label.Id);
    }
}