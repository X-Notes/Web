using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class SendInvitesToUsersFolders : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<int> UserIds { set; get; }
        [Required]
        public Guid FolderId { set; get; }
        [Required]
        public RefType RefType { set; get; }
        [Required]
        public bool SendMessage { set; get; }
        public string Message { set; get; }
    }
}
