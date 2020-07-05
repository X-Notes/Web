using AutoMapper;
using Domain.Commands.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.models;
using WriteContext.Repositories;

namespace BI.services
{
    public class LabelHandlerCommand:
        IRequestHandler<NewLabel, int>,
        IRequestHandler<DeleteLabel, Unit>,
        IRequestHandler<UpdateLabel, Unit>
    {
        private readonly LabelRepository labelRepository;
        private readonly UserRepository userRepository;
        private readonly IMapper mapper;
        public LabelHandlerCommand(LabelRepository labelRepository, UserRepository userRepository, IMapper mapper)
        {
            this.labelRepository = labelRepository;
            this.userRepository = userRepository;
            this.mapper = mapper;
        }


        public async Task<Unit> Handle(DeleteLabel request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                await labelRepository.DeleteLabel(label);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateLabel request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                await labelRepository.UpdateLabel(label);
            }
            return Unit.Value;
        }

        public async Task<int> Handle(NewLabel request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var label = mapper.Map<Label>(request);
            label.UserId = user.Id;
            await labelRepository.NewLabel(label);
            return label.Id;
        }
    }
}
