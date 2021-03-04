using Common.Attributes;
using Common.DatabaseModels.models;
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
        public List<Guid> UserIds { set; get; }
        [ValidationGuidAttribute]
        public Guid FolderId { set; get; }
        [ValidationGuidAttribute]
        public Guid RefTypeId { set; get; }
        [Required]
        public bool SendMessage { set; get; }
        public string Message { set; get; }
    }
}
