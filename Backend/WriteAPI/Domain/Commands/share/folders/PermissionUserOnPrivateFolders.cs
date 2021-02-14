using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid FolderId { set; get; }
        [Required]
        public Guid UserId { set; get; }
        [Required]
        public RefType AccessType { set; get; }
    }
}
