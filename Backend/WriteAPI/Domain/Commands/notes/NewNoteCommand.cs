using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class NewNoteCommand: BaseCommandEntity, IRequest<int>
    {
        public NewNoteCommand(string email)
            :base(email)
        {

        }
    }
}
