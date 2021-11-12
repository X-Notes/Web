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
        public async Task<List<NoteHistoryDTO>> GetHistories(Guid noteId)
        {
            return await mediator.Send(new GetNoteHistoriesQuery(noteId, this.GetUserEmail()));
        }

        [HttpGet("snapshot/{noteId}/{snapshotId}")]
        public async Task<NoteHistoryDTOAnswer> GetSnapshot(Guid noteId, Guid snapshotId)
        {
            var email = this.GetUserEmail();
            return await mediator.Send(new GetNoteSnapshotQuery(snapshotId, noteId, email));
        }

        [HttpGet("snapshot/contents/{noteId}/{snapshotId}")]
        public async Task<List<BaseNoteContentDTO>> GetSnapshotContent(Guid noteId, Guid snapshotId)
        {
            var email = this.GetUserEmail();
            var command = new GetSnapshotContentsQuery(email, noteId, snapshotId);
            return await mediator.Send(command);
        }
    }
}
