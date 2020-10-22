using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.notes
{
    public class SendInvitesToUsersNotes : BaseCommandEntity, IRequest<Unit>
    {
    }
}
