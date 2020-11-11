using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.folders
{
    public class ArchiveFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        public List<string> Ids { set; get; }
        public ArchiveFolderCommand(string email) : base(email)
        {

        }
    }
}
