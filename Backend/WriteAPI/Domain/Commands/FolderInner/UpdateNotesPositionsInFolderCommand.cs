using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.FolderInner
{
    public class UpdateNotesPositionsInFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<EntityPositionDTO> Positions { set; get; }
    }

}
