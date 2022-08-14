using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Folders
{
    public class MakePrivateFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>> 
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public MakePrivateFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
