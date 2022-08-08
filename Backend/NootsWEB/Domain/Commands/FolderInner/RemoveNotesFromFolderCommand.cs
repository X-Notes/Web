using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.FolderInner
{
    public class RemoveNotesFromFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        public List<Guid> NoteIds { set; get; }
    }
}
