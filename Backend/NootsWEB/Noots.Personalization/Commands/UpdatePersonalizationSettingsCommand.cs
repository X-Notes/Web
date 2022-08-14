using Common.CQRS;
using Common.DTO.Personalization;
using MediatR;

namespace Noots.Personalization.Commands
{
    public class UpdatePersonalizationSettingsCommand : BaseCommandEntity, IRequest<Unit>
    {
        public PersonalizationSettingDTO PersonalizationSetting { set; get; }
    }
}
