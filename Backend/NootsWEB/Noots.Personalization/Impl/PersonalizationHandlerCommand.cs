using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.Personalization;
using MediatR;
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

            var pSettings = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);

            if (pSettings == null)
            {
                pSettings = new PersonalizationSetting().GetNewFactory(request.UserId);
                await personalizationSettingRepository.AddAsync(pSettings);
            }

            pSettings.SetUpdateStatus(request.PersonalizationSetting);

            if (pSettings.HasUpdates)
            {
                pSettings.UpdateSortSettings(request.PersonalizationSetting);
                pSettings.UpdatePersonalizationSettings(request.PersonalizationSetting);
                await personalizationSettingRepository.UpdateAsync(pSettings);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }
    }
}