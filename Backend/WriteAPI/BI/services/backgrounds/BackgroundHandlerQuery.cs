using AutoMapper;
using Common.DTO.backgrounds;
using Domain.Queries.backgrounds;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

namespace BI.services.backgrounds
{
    public class BackgroundHandlerQuery:
        IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>
    {
        private readonly IMapper mapper;
        private readonly BackgroundRepository backgroundRepository;
        private readonly UserRepository userRepository;
        public BackgroundHandlerQuery(IMapper mapper, BackgroundRepository backgroundRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
        }

        public async Task<List<BackgroundDTO>> Handle(GetUserBackgroundsQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.Email);
            if (user != null)
            {
                user.Backgrounds.Reverse();
                return mapper.Map<List<BackgroundDTO>>(user.Backgrounds);
            }
            return new List<BackgroundDTO>();
        }
    }
}
