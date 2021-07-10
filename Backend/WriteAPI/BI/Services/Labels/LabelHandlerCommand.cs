using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common;
using Common.DatabaseModels.Models.Labels;
using Domain.Commands.Labels;
using MediatR;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Users;

namespace BI.Services.Labels
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
        public LabelHandlerCommand(LabelRepository labelRepository, UserRepository userRepository)
        {
            this.labelRepository = labelRepository;
            this.userRepository = userRepository;
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
                label.UpdatedAt = DateTimeOffset.Now;
                await labelRepository.Update(label);
            }
            return Unit.Value;
        }

        public async Task<Guid> Handle(NewLabelCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var label = new Label();
            label.UserId = user.Id;
            label.Order = 1;
            label.Color = LabelsColorPallete.Red;
            label.CreatedAt = DateTimeOffset.Now;
            label.UpdatedAt = DateTimeOffset.Now;

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
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var labels = await labelRepository.GetWhere(x => x.UserId == user.Id && x.IsDeleted == true);
                await labelRepository.RemoveRange(labels);
            }
            return Unit.Value;
        }
    }
}
