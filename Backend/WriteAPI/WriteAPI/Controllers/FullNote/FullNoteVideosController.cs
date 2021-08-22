using System;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Videos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;
namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/videos")]
    [ApiController]
    public class FullNoteVideosController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteVideosController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("{id}/{contentId}")]
        public async Task<OperationResult<VideoNoteDTO>> InsertVideos(IFormFile video, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            var validatioResult = this.ValidateFile<VideoNoteDTO>(video, SupportFileContentTypes.Videos);
            if (!validatioResult.Success)
            {
                return validatioResult;
            }

            var command = new InsertVideosToNoteCommand(video, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command, cancellationToken);
        }


        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveVideo(RemoveVideoCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}