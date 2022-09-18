using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Noots.Labels.Commands
{
    public class UpdatePositionsLabelCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}
