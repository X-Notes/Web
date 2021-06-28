using Common.DTO.Personalization;
using Domain.Commands;
using MediatR;

namespace Domain.Queries.Personalization
{
    public class GetUserPersonalizationSettingsQuery : BaseCommandEntity, IRequest<PersonalizationSettingDTO>
    {
        public GetUserPersonalizationSettingsQuery(string email): base(email)
        {

        }
    }
}
