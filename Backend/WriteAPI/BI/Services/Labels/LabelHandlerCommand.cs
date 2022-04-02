using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DTO;
using Domain.Commands.Labels;
using MediatR;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Users;

namespace BI.Services.Labels
{
    public class LabelHandlerCommand :
        IRequestHandler<NewLabelCommand, Guid>,
        IRequestHandler<DeleteLabelCommand, Unit>,
        IRequestHandler<UpdateLabelCommand, Unit>,
        IRequestHandler<SetDeletedLabelCommand, Unit>,
        IRequestHandler<RestoreLabelCommand, Unit>,
        IRequestHandler<RemoveAllFromBinCommand, Unit>,
        IRequestHandler<UpdatePositionsLabelCommand, OperationResult<Unit>>
    {
        private readonly LabelRepository labelRepository;
        public LabelHandlerCommand(LabelRepository labelRepository)
        {
            this.labelRepository = labelRepository;
        }


        public async Task<Unit> Handle(DeleteLabelCommand request, CancellationToken cancellationToken)
        {
            var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
            if (label != null)
            {
                await labelRepository.RemoveAsync(label);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeletedLabelCommand request, CancellationToken cancellationToken)
        {
            var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
            if (label != null)
            {
                label.ToType(true, DateTimeProvider.Time);
                await labelRepository.UpdateAsync(label);
            }
            return Unit.Value;
        }


        public async Task<Unit> Handle(UpdateLabelCommand request, CancellationToken cancellationToken)
        {
            var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
            if (label != null)
            {
                label.Color = request.Color;
                label.Name = request.Name;
                label.UpdatedAt = DateTimeProvider.Time;
                await labelRepository.UpdateAsync(label);
            }
            return Unit.Value;
        }

        public async Task<Guid> Handle(NewLabelCommand request, CancellationToken cancellationToken)
        {
            var label = new Label();
            label.UserId = request.UserId;
            label.Color = LabelsColorPallete.Red;
            label.CreatedAt = DateTimeProvider.Time;
            label.UpdatedAt = DateTimeProvider.Time;

            await labelRepository.AddAsync(label);
            return label.Id;
        }


        public async Task<Unit> Handle(RestoreLabelCommand request, CancellationToken cancellationToken)
        {
            var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);
            if (label != null)
            {
                label.ToType(false);
                await labelRepository.UpdateAsync(label);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveAllFromBinCommand request, CancellationToken cancellationToken)
        {
            var labels = await labelRepository.GetWhereAsync(x => x.UserId == request.UserId && x.IsDeleted == true);

            if (labels.Any())
            {
                await labelRepository.RemoveRangeAsync(labels);
            }

            return Unit.Value;
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePositionsLabelCommand request, CancellationToken cancellationToken)
        {
            var labelIds = request.Positions.Select(x => x.EntityId).ToList();
            var labels = await labelRepository.GetWhereAsync(x => x.UserId == request.UserId && labelIds.Contains(x.Id));

            if (labels.Any())
            {
                request.Positions.ForEach(x =>
                {
                    var label = labels.FirstOrDefault(z => z.Id == x.EntityId);
                    if (label != null)
                    {
                        label.Order = x.Position;
                    }
                });

                await labelRepository.UpdateRangeAsync(labels);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }
    }
}
