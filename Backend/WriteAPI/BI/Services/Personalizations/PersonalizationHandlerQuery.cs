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
