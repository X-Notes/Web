using Common.CQRS;
using Common.DTO.Personalization;
using MediatR;
using System;

namespace Domain.Queries.Personalization
{
    public class GetUserPersonalizationSettingsQuery : BaseCommandEntity, IRequest<PersonalizationSettingDTO>
    {
        public GetUserPersonalizationSettingsQuery(Guid userId) : base(userId)
        {

        }
    }
}
