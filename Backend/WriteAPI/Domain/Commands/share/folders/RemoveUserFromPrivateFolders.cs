using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class RemoveUserFromPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        public Guid FolderId { set; get; }
        public int UserId { set; get; }
    }
}
