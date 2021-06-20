using AutoMapper;
using Common.DTO.labels;
using Domain.Queries.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using BI.Mapping;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Users;

namespace BI.services.labels
{
    public class LabelHandlerQuery :
        IRequestHandler<GetLabelsByEmail, LabelsDTO>,
        IRequestHandler<GetCountNotesByLabel, int>
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

        public async Task<LabelsDTO> Handle(GetLabelsByEmail request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var labels = await labelRepository.GetAllByUserID(user.Id);

                foreach(var label in labels)
                {
                    label.LabelsNotes = label.LabelsNotes.Where(x => x.Note.IsHistory == false).ToList();
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

        public async Task<int> Handle(GetCountNotesByLabel request, CancellationToken cancellationToken)
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
