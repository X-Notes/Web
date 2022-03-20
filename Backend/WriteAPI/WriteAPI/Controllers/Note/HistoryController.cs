using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.History;
using Domain.Queries.History;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO;

namespace WriteAPI.Controllers.Note
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryController : ControllerBase
    {
        private readonly IMediator mediator;
        public HistoryController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet("{noteId}")]
        public async Task<OperationResult<List<NoteHistoryDTO>>> GetHistories(Guid noteId)
        {
            return await mediator.Send(new GetNoteHistoriesQuery(noteId, this.GetUserId()));
        }

        [HttpGet("snapshot/{noteId}/{snapshotId}")]
        public async Task<OperationResult<NoteHistoryDTOAnswer>> GetSnapshot(Guid noteId, Guid snapshotId)
        {
            return await mediator.Send(new GetNoteSnapshotQuery(snapshotId, noteId, this.GetUserId()));
        }

        [HttpGet("snapshot/contents/{noteId}/{snapshotId}")]
        public async Task<OperationResult<List<BaseNoteContentDTO>>> GetSnapshotContent(Guid noteId, Guid snapshotId)
        {
            var command = new GetSnapshotContentsQuery(this.GetUserId(), noteId, snapshotId);
            return await mediator.Send(command);
        }
    }
}
