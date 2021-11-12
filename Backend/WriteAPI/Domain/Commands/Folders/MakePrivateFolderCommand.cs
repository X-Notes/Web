using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Folders
{
    public class MakePrivateFolderCommand : BaseCommandEntity, IRequest<Unit> 
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public MakePrivateFolderCommand(string email) : base(email)
        {

        }
    }
}
