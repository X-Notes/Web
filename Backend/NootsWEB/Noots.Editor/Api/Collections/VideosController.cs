using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using Editor.Commands.Videos;
using Editor.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Collections;

[Authorize]
[Route("api/editor/videos")]
[ApiController]
public class VideosController : BaseCollectionsController
<
    RemoveVideosFromCollectionCommand,
    AddVideosToCollectionCommand,
    UpdateVideosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<VideoNoteDTO>,
    VideoNoteDTO
>
{
    public VideosController(IMediator _mediator) : base(_mediator)
    {
    }

    [HttpPost("transform")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<VideosCollectionNoteDTO>> TransformToVideos(TransformToVideosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}