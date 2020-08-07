using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class RestoreNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        public List<string> Ids { set; get; }
        public RestoreNoteCommand(string email) : base(email)
        {

        }
    }
}
