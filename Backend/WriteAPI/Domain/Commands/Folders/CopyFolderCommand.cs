using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Folders;
using MediatR;

namespace Domain.Commands.Folders
{
    public class CopyFolderCommand : BaseCommandEntity, IRequest<List<SmallFolder>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public CopyFolderCommand(string email): base(email)
        {

        }
    }
}
