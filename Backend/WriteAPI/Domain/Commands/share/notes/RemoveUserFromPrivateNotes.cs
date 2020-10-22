using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.share.notes
{
    public class RemoveUserFromPrivateNotes : BaseCommandEntity, IRequest<Unit>
    {
        public Guid NoteId { set; get; }
        public int UserId { set; get; }
    }
}
