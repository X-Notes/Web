using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Labels;
using Domain.Commands.Labels;
using Domain.Queries.Labels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LabelController : ControllerBase
    {
        private readonly IMediator _mediator;
        public LabelController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost]
        public async Task<JsonResult> Add(NewLabelCommand command)
        {
            command.UserId = this.GetUserId();
            return new JsonResult(await _mediator.Send(command));
        }

        [HttpGet]
        public async Task<LabelsDTO> GetUserLabels()
        {
            return await _mediator.Send(new GetLabelsByEmailQuery(this.GetUserId()));
        }

        [HttpGet("count/{id}")]
        public async Task<int> NotesCountByLabel(Guid id)
        {
            var command = new GetCountNotesByLabelQuery { LabelId = id };
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPut]
        public async Task Update(UpdateLabelCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }

        [HttpDelete("perm/{id}")]
        public async Task DeletePerm(Guid id)
        {
            await _mediator.Send(new DeleteLabelCommand(this.GetUserId(), id));
        }

        [HttpDelete("{id}")]
        public async Task Delete(Guid id)
        {
            await _mediator.Send(new SetDeletedLabelCommand(this.GetUserId(), id));
        }

        [HttpGet("restore/{id}")]
        public async Task RestoreLabel(Guid id)
        {
            await _mediator.Send(new RestoreLabelCommand(this.GetUserId(), id));
        }

        [HttpDelete]
        public async Task RemoveAllFromBin()
        {
            await _mediator.Send(new RemoveAllFromBinCommand(this.GetUserId()));
        }
    }
}