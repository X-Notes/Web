using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO.Personalization;
using Domain.Queries.Personalization;
using MediatR;
using WriteContext.Repositories.Users;

namespace BI.Services.Personalizations
{
    public class PersonalizationHandlerQuery
        : IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>
    {

        private readonly UserRepository userRepository;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        private readonly NoteFolderLabelMapper appCustomMapper;

        public PersonalizationHandlerQuery(
            UserRepository userRepository,
            PersonalizationSettingRepository personalizationSettingRepository,
            NoteFolderLabelMapper appCustomMapper)
        {
            this.userRepository = userRepository;
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
