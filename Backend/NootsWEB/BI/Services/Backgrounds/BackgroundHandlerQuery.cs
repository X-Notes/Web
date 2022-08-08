using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO.Backgrounds;
using Domain.Queries.Backgrounds;
using MediatR;
using WriteContext.Repositories.Users;

namespace BI.Services.Backgrounds
{
    public class BackgroundHandlerQuery:
        IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>
    {
        private readonly UserRepository userRepository;
        private readonly UserBackgroundMapper userBackgroundMapper;

        public BackgroundHandlerQuery(UserRepository userRepository, UserBackgroundMapper userBackgroundMapper)
        {
            this.userRepository = userRepository;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<List<BackgroundDTO>> Handle(GetUserBackgroundsQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.UserId);
            if (user != null)
            {
                return user.Backgrounds.Select(x => userBackgroundMapper.MapToBackgroundDTO(x)).ToList();
            }
            return new List<BackgroundDTO>();
        }
    }
}
