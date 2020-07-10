using AutoMapper;
using Common.DTO.labels;
using Domain.Queries.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.models;
using WriteContext.Repositories;
using System.Linq;

namespace BI.services
{
    public class LabelHandlerQuery:
        IRequestHandler<GetLabelsByEmail, List<LabelDTO>>
    {
        private readonly UserRepository userRepository;
        private readonly LabelRepository labelRepository;
        private readonly IMapper mapper;
        public LabelHandlerQuery(IMapper mapper, LabelRepository labelRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.labelRepository = labelRepository;
            this.userRepository = userRepository;
        }

        public async Task<List<LabelDTO>> Handle(GetLabelsByEmail request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var labels = (await labelRepository.GetAll(user.Id)).OrderBy(x => x.Order);
                return mapper.Map<List<LabelDTO>>(labels);
            }
            return null;
        }
    }
}
