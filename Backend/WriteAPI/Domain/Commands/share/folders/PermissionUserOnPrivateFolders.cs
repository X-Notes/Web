using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        public Guid FolderId { set; get; }
        public int UserId { set; get; }
        public RefType AccessType { set; get; }
    }
}
