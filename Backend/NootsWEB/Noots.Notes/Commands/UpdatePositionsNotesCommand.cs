using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Notes.Commands
{
    public class UpdatePositionsNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}
