using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Folders
{
    public class DeleteFoldersCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public DeleteFoldersCommand(Guid userId) : base(userId)
        {

        }
    }
}
