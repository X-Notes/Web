using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using BI.Mapping;
using Common.DTO.Labels;
using Domain.Queries.Labels;
using MediatR;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Users;

namespace BI.Services.Labels
{
    public class LabelHandlerQuery :
        IRequestHandler<GetLabelsByEmailQuery, LabelsDTO>,
        IRequestHandler<GetCountNotesByLabelQuery, int>
    {
        private readonly UserRepository userRepository;
        private readonly LabelRepository labelRepository;
        private AppCustomMapper appCustomMapper;
        public LabelHandlerQuery(IMapper mapper, LabelRepository labelRepository, UserRepository userRepository,
            AppCustomMapper appCustomMapper)
        {
            this.labelRepository = labelRepository;
            this.userRepository = userRepository;
            this.appCustomMapper = appCustomMapper;
        }

        public async Task<LabelsDTO> Handle(GetLabelsByEmailQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var labels = await labelRepository.GetAllByUserID(user.Id);

                foreach(var label in labels)
                {
                    label.LabelsNotes = label.LabelsNotes.ToList();
                }

                var labelsAll = labels.Where(x => x.IsDeleted == false).OrderBy(x => x.Order).ToList();
                var labelsDeleted = labels.Where(x => x.IsDeleted == true).OrderBy(x => x.Order).ToList();

                return new LabelsDTO()
                {
                    LabelsAll = appCustomMapper.MapLabelsToLabelsDTO(labelsAll),
                    LabelsDeleted = appCustomMapper.MapLabelsToLabelsDTO(labelsDeleted)
                };
            }
            throw new Exception("User not found");
        }

        public async Task<int> Handle(GetCountNotesByLabelQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                return await this.labelRepository.GetNotesCountByLabelId(request.LabelId);
            }
            throw new Exception("User not found");
        }
    }
}
