using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Personalization;
using Domain.Commands.Notes;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.Note
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public NoteController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpGet("new")]
        public async Task<SmallNote> Add()
        {
            var command = new NewPrivateNoteCommand(this.GetUserId());
            return await _mediator.Send(command);
        }

        // Commands

        [HttpPatch("color")]
        public async Task<OperationResult<Unit>> ChangeColor([FromBody] ChangeColorNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPatch("delete/permanently")]
        public async Task<OperationResult<Unit>> DeleteNotes([FromBody] DeleteNotesCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPatch("copy")]
        public async Task<OperationResult<List<Guid>>> CopyNote([FromBody] CopyNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        [HttpPatch("archive")]
        public async Task<OperationResult<Unit>> ArchiveNote([FromBody] ArchiveNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPatch("delete")]
        public async Task<OperationResult<List<Guid>>> SetDeleteNotes([FromBody] SetDeleteNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPatch("ref/private")]
        public async Task<OperationResult<Unit>> MakePrivate([FromBody] MakePrivateNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        [HttpPatch("label/add")]
        public async Task<OperationResult<Unit>> AddLabel([FromBody] AddLabelOnNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        [HttpPatch("label/remove")]
        public async Task<OperationResult<Unit>> RemoveLabel([FromBody] RemoveLabelFromNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        // GET Entities
        [HttpGet("type/{typeId}")]
        public async Task<List<SmallNote>> GetNotesByType(NoteTypeENUM typeId, [FromQuery] PersonalizationSettingDTO settings)
        {
            var query = new GetNotesByTypeQuery(this.GetUserId(), typeId, settings);
            return await _mediator.Send(query);
        }


        [HttpPost("additional")]
        public async Task<List<BottomNoteContent>> GetAdditionalInfo(GetAdditionalContentNoteInfoQuery query)
        {
            query.UserId = this.GetUserId();
            return await _mediator.Send(query);
        }

        [HttpPost("many")]
        public async Task<OperationResult<List<SmallNote>>> GetNoteByIds(GetNotesByNoteIdsQuery query)
        {
            query.UserId = this.GetUserId();
            return await _mediator.Send(query);
        }

        [HttpPost("all")]
        public async Task<List<SmallNote>> GetAllNotes(GetAllNotesQuery query)
        {
            query.UserId = this.GetUserId();
            return await _mediator.Send(query);
        }

        [HttpGet("{noteId}")]
        [AllowAnonymous]
        public async Task<OperationResult<FullNote>> Get(Guid noteId, [FromQuery] Guid? folderId)
        {
            var query = new GetFullNoteQuery(this.GetUserIdUnStrict(), noteId, folderId);
            return await _mediator.Send(query);
        }

        [HttpPatch("order")]
        public async Task<OperationResult<Unit>> UpdateOrder(UpdatePositionsNotesCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }
}