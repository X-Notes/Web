﻿using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Videos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNote
{
    [Authorize]
    [Route("api/note/inner/videos")]
    [ApiController]
    public class FullNoteVideosController : BaseNoteFileContentController
        <
        RemoveVideosFromCollectionCommand,
        AddVideosToCollectionCommand,
        UpdateVideosCollectionInfoCommand
        >
    {
        public FullNoteVideosController(IMediator _mediator) : base(_mediator)
        {
        }

        [HttpPost("transform")]
        public async Task<OperationResult<VideosCollectionNoteDTO>> TransformToVideos(TransformToVideosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}