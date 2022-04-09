﻿using System;
using System.Collections.Generic;
using Common.DTO;
using Common.DTO.History;
using MediatR;

namespace Domain.Queries.History
{
    public class GetNoteHistoriesQuery : BaseQueryEntity, IRequest<OperationResult<List<NoteHistoryDTO>>>
    {
        public Guid NoteId { set; get; }
        public GetNoteHistoriesQuery(Guid NoteId, Guid userId)
        {
            this.NoteId = NoteId;
            this.UserId = userId;
        }
    }
}
