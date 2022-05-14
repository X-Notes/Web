using Common.Attributes;
using Common.DTO;
using MediatR;
using System;

namespace Domain.Commands.Share.Folders
{
    public class RemoveAllUsersFromFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }
    }
}
