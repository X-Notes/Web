using Common.CQRS;
using Common.DTO;
using Common.DTO.Personalization;
using MediatR;

namespace Noots.Personalization.Commands
{
    public class UpdatePersonalizationSettingsCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public PersonalizationSettingDTO PersonalizationSetting { set; get; }
    }
}
