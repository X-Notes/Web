using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO.Backgrounds;
using Domain.Queries.Backgrounds;
using MediatR;
using WriteContext.Repositories.Users;

namespace BI.Services.Backgrounds
{
    public class BackgroundHandlerQuery:
        IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>
    {
        private readonly IMapper mapper;
        private readonly UserRepository userRepository;
        public BackgroundHandlerQuery(IMapper mapper, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.userRepository = userRepository;
        }

        public async Task<List<BackgroundDTO>> Handle(GetUserBackgroundsQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.Email);
            if (user != null)
            {
                return mapper.Map<List<BackgroundDTO>>(user.Backgrounds);
            }
            return new List<BackgroundDTO>();
        }
    }
}
