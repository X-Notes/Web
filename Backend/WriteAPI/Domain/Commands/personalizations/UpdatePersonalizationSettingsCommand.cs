using Common.DTO.personalization;
using MediatR;

namespace Domain.Commands.personalizations
{
    public class UpdatePersonalizationSettingsCommand : BaseCommandEntity, IRequest<Unit>
    {
        public PersonalizationSettingDTO PersonalizationSetting { set; get; }
    }
}
