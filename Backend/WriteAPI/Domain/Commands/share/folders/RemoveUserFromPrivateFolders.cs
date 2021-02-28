using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class RemoveUserFromPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid FolderId { set; get; }
        [Required]
        public Guid UserId { set; get; }
    }
}
