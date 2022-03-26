using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.FolderInner
{
    public class UpdateNotesPositionInFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        public List<NotePositionDTO> Positions { set; get; }
    }

}
