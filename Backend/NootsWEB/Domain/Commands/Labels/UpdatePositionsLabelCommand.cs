using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using System.Collections.Generic;

namespace Domain.Commands.Labels
{
    public class UpdatePositionsLabelCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}
