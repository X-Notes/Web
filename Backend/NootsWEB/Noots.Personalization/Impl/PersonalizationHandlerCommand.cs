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

        public PersonalizationHandlerCommand(
            PersonalizationSettingRepository personalizationSettingRepository)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePersonalizationSettingsCommand request, CancellationToken cancellationToken)
        {
            if(request.PersonalizationSetting == null)
            {
                return new OperationResult<Unit>().SetAnotherError();
            }

            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
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
