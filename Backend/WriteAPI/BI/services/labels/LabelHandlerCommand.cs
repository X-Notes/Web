using AutoMapper;
using Common;
using Common.DatabaseModels.models;
using Domain.Commands.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.labels
{
    public class LabelHandlerCommand :
        IRequestHandler<NewLabelCommand, Guid>,
        IRequestHandler<SetDeleteLabelCommand, Unit>,
        IRequestHandler<UpdateLabelCommand, Unit>,
        IRequestHandler<SetDeletedLabelCommand, Unit>,
        IRequestHandler<RestoreLabelCommand, Unit>,
        IRequestHandler<RemoveAllFromBinCommand, Unit>
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


        public async Task<Unit> Handle(SetDeleteLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                await labelRepository.SetDeleteLabel(label, user.Labels);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                label.Color = request.Color;
                label.Name = request.Name;
                await labelRepository.UpdateLabel(label);
            }
            return Unit.Value;
        }

        public async Task<Guid> Handle(NewLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            var label = mapper.Map<Label>(request);
            label.UserId = user.Id;
            label.Order = 1;
            label.Color = LabelsColorPallete.Red;
            label.Name = "";
            label.CreatedAt = DateTimeOffset.Now;

            await labelRepository.NewLabel(label);
            return label.Id;
        }

        public async Task<Unit> Handle(SetDeletedLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                await labelRepository.SetDeletedLabel(label, user.Labels);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RestoreLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithLabels(request.Email);
            var label = user.Labels.Where(x => x.Id == request.Id).FirstOrDefault();
            if (label != null)
            {
                await labelRepository.RestoreLabel(label, user.Labels);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveAllFromBinCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if(user != null)
            {
                var labels = await labelRepository.GetDeletedByUserID(user.Id);
                await labelRepository.RemoveAll(labels);
            }
            return Unit.Value;
        }
    }
}
