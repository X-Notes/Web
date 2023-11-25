using Common.CQRS;
using Common.DTO.Personalization;
using MediatR;

namespace Personalization.Queries
{
    public class GetUserPersonalizationSettingsQuery : BaseCommandEntity, IRequest<PersonalizationSettingDTO>
    {
        public GetUserPersonalizationSettingsQuery(Guid userId) : base(userId)
        {

        }
    }
}
