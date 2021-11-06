using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
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

        [HttpPost("upload/{id}/{contentId}")]
        public async Task<OperationResult<List<VideoNoteDTO>>> UploadVideosToCollection(List<IFormFile> videos, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (videos.Count == 0) // TODO MOVE TO FILTER
            {
                return new OperationResult<List<VideoNoteDTO>>().SetNoAnyFile();
            }

            var results = videos.Select(document => this.ValidateFile<List<VideoNoteDTO>>(document, SupportFileContentTypes.Videos));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadVideosToCollectionCommands(id, contentId, videos);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command, cancellationToken);
        }

        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveVideo(UnlinkVideosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpPost("transform")]
        public async Task<OperationResult<VideosCollectionNoteDTO>> TransformToVideos(TransformToVideosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("sync")]
        public async Task<OperationResult<Unit>> SyncTextContents(UpdateVideosContentsCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }
    }

}