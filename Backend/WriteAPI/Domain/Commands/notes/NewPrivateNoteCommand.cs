using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<string>
    {
        public NewPrivateNoteCommand(string email)
            :base(email)
        {

        }
    }
}
