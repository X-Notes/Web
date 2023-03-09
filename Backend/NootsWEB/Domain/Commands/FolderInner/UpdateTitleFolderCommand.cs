using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.RGA_CRDT;

namespace Domain.Commands.FolderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public List<MergeTransaction<string>> Transactions { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}
