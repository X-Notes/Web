﻿using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands.Videos;
using Noots.Editor.Queries;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers.FullNoteAPI;

[Authorize]
[Route("api/note/inner/videos")]
[ApiController]
public class FullNoteVideosController : BaseNoteFileContentController
<
    RemoveVideosFromCollectionCommand,
    AddVideosToCollectionCommand,
    UpdateVideosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<VideoNoteDTO>,
    VideoNoteDTO
>
{
    public FullNoteVideosController(IMediator _mediator) : base(_mediator)
    {
    }

    [HttpPost("transform")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<VideosCollectionNoteDTO>> TransformToVideos(TransformToVideosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}