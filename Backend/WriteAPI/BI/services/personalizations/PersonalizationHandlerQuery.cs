using BI.Mapping;
using Common.DTO.personalization;
using Domain.Queries.personalization;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

namespace BI.services.personalizations
{
    public class PersonalizationHandlerQuery
        : IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>
    {

        private readonly UserRepository userRepository;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        private readonly AppCustomMapper appCustomMapper;

        public PersonalizationHandlerQuery(
            UserRepository userRepository,
            PersonalizationSettingRepository personalizationSettingRepository,
            AppCustomMapper appCustomMapper)
        {
            this.userRepository = userRepository;
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.appCustomMapper = appCustomMapper;
        }

        public async Task<PersonalizationSettingDTO> Handle(GetUserPersonalizationSettingsQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == user.Id);
                return appCustomMapper.MapPersonalizationSettingToPersonalizationSettingDTO(pr);
            }
            throw new System.Exception("User not found");
        }
    }
}
