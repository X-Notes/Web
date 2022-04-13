using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Folders
{
    public class SetDeleteFolderCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }


        public SetDeleteFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
