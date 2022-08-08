using Common.Attributes;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using System.Collections.Generic;

namespace Domain.Commands.Notes
{
    public class UpdatePositionsNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}
