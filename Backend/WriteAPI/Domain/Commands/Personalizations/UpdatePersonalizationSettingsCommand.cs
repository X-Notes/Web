using Common.DTO.Personalization;
using MediatR;

namespace Domain.Commands.Personalizations
{
    public class UpdatePersonalizationSettingsCommand : BaseCommandEntity, IRequest<Unit>
    {
        public PersonalizationSettingDTO PersonalizationSetting { set; get; }
    }
}
