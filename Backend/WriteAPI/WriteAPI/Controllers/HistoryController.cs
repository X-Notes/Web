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

namespace WriteAPI.Controllers
{
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
            return await mediator.Send(new GetNoteHistories(noteId, this.GetUserEmail()));
        }

    }
}
