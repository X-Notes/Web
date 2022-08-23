using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Noots.Folders.Commands
{
    public class UpdatePositionsFoldersCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}
