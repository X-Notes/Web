using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class SendInvitesToUsersFolders : BaseCommandEntity, IRequest<Unit>
    {
        public List<int> UserIds { set; get; }
        public Guid FolderId { set; get; }
        public RefType RefType { set; get; }
        public bool SendMessage { set; get; }
        public string Message { set; get; }
    }
}
