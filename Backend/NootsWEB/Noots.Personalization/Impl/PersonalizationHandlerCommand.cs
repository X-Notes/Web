using Common.DTO;
using Common.DTO.Personalization;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Personalization.Commands;

namespace Noots.Personalization.Impl
{
    public class PersonalizationHandlerCommand
        : IRequestHandler<UpdatePersonalizationSettingsCommand, OperationResult<Unit>>
    {

        private readonly PersonalizationSettingRepository personalizationSettingRepository;
        private readonly BillingPermissionService billingPermissionService;

        public PersonalizationHandlerCommand(
            PersonalizationSettingRepository personalizationSettingRepository,
            BillingPermissionService billingPermissionService)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.billingPermissionService = billingPermissionService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePersonalizationSettingsCommand request, CancellationToken cancellationToken)
        {
            if(request.PersonalizationSetting == null)
            {
                return new OperationResult<Unit>().SetAnotherError();
            }

            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
            var isPremiumPlan = await billingPermissionService.IsUserPlanPremiumAsync(request.UserId);
            if (!isPremiumPlan)
            {
                pr.SetUpdateStatus(request.PersonalizationSetting);
                if (pr.HasUpdates)
                {
                    pr.UpdateSortSettings(request.PersonalizationSetting);
                    await personalizationSettingRepository.UpdateAsync(pr);
                    return new OperationResult<Unit>(true, Unit.Value);
                }
                return new OperationResult<Unit>().SetBillingError();
            }

            pr.SetUpdateStatus(request.PersonalizationSetting);
            if (pr.HasUpdates)
            {
                pr.UpdateSortSettings(request.PersonalizationSetting);
                pr.UpdatePersonalizationSettings(request.PersonalizationSetting);
                await personalizationSettingRepository.UpdateAsync(pr);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }
    }
}
