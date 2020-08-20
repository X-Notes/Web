using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.folders
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<string>
    {
        public NewFolderCommand(string email): base(email)
        {

        }
    }
}
