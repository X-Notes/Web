using Common.DTO.personalization;
using Domain.Commands;
using MediatR;

namespace Domain.Queries.personalization
{
    public class GetUserPersonalizationSettingsQuery : BaseCommandEntity, IRequest<PersonalizationSettingDTO>
    {
        public GetUserPersonalizationSettingsQuery(string email): base(email)
        {

        }
    }
}
