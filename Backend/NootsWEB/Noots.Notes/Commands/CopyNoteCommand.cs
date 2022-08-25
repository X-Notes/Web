﻿using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Notes.Commands
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public Guid? FolderId { set; get; }


        public CopyNoteCommand(Guid userId) : base(userId)
        {

        }
    }
}