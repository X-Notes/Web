using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Personalization;
using Domain.Queries.Personalization;
using MediatR;
using Noots.Mapper.Mapping;
using WriteContext.Repositories.Users;

namespace BI.Services.Personalizations
{
    public class PersonalizationHandlerQuery : IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>
    {
        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        private readonly NoteFolderLabelMapper appCustomMapper;

        public PersonalizationHandlerQuery(
            PersonalizationSettingRepository personalizationSettingRepository,
            NoteFolderLabelMapper appCustomMapper)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.appCustomMapper = appCustomMapper;
        }

        public async Task<PersonalizationSettingDTO> Handle(GetUserPersonalizationSettingsQuery request, CancellationToken cancellationToken)
        {
            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
            return appCustomMapper.MapPersonalizationSettingToPersonalizationSettingDTO(pr);
        }
    }
}
