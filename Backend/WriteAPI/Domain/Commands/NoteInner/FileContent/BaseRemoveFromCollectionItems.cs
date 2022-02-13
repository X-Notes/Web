﻿using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent
{
    public class BaseRemoveFromCollectionItems : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public List<Guid> FileIds { set; get; }

        public BaseRemoveFromCollectionItems(Guid noteId, Guid contentId, List<Guid> fileIds)
        {
            NoteId = noteId;
            ContentId = contentId;
            FileIds = fileIds;
        }
    }
}