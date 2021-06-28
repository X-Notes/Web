using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class RemoveUserFromPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }
        [ValidationGuid]
        public Guid UserId { set; get; }
    }
}
