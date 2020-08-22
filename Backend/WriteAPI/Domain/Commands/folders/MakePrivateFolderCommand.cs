using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.folders
{
    public class MakePrivateFolderCommand : BaseCommandEntity, IRequest<Unit> 
    {
        public List<string> Ids { set; get; }
        public FoldersType FolderType { set; get; }
        public MakePrivateFolderCommand(string email) : base(email)
        {

        }
    }
}
