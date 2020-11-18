using AutoMapper;
using Common.DTO.labels;
using Domain.Queries.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using System.Linq;

namespace BI.services.labels
{
    public class LabelHandlerQuery :
        IRequestHandler<GetLabelsByEmail, LabelsDTO>,
        IRequestHandler<GetCountNotesByLabel, int>
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

        public async Task<LabelsDTO> Handle(GetLabelsByEmail request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var labels = await labelRepository.GetAllByUserID(user.Id);

                var labelsAll = labels.Where(x => x.IsDeleted == false).OrderBy(x => x.Order).ToList();
                var labelsDeleted = labels.Where(x => x.IsDeleted == true).OrderBy(x => x.Order).ToList();

                return new LabelsDTO()
                {
                    LabelsAll = mapper.Map<List<LabelDTO>>(labelsAll),
                    LabelsDeleted = mapper.Map<List<LabelDTO>>(labelsDeleted)
                };
            }
            throw new Exception("User not found");
        }

        public async Task<int> Handle(GetCountNotesByLabel request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                return await this.labelRepository.GetNotesCountByLabelId(request.LabelId);
            }
            throw new Exception("User not found");
        }
    }
}
