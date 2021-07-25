using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.History;
using Domain.Queries.History;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;

namespace WriteAPI.Controllers
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

        [HttpGet("snapshot/{noteId}/{historyId}")]
        public async Task<NoteHistoryDTOAnswer> GetSnapshot(Guid noteId, Guid historyId)
        {
            var email = this.GetUserEmail();
            return await mediator.Send(new GetNoteSnapshotQuery(historyId, noteId, email));
        }

    } 
}
