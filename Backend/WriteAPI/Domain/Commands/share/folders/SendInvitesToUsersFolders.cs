using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class SendInvitesToUsersFolders : BaseCommandEntity, IRequest<Unit>
    {
    }
}
