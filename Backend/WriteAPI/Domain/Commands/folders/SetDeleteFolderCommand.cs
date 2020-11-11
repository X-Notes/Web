using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.folders
{
    public class SetDeleteFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        public List<string> Ids { set; get; }
        public SetDeleteFolderCommand(string email) : base(email)
        {

        }
    }
}
