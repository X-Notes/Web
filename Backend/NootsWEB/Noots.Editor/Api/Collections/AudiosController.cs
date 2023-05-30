using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands.Audios;
using Noots.Editor.Queries;

namespace Noots.Editor.Api.Collections;

[Authorize]
[Route("api/note/inner/audios")]
[ApiController]
public class AudiosController : BaseCollectionsController
<
    RemoveAudiosFromCollectionCommand,
    AddAudiosToCollectionCommand,
    UpdateAudiosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<AudioNoteDTO>,
    AudioNoteDTO
>
{

    public AudiosController(IMediator _mediator) : base(_mediator)
    {
    }

    [HttpPost("transform")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<AudiosCollectionNoteDTO>> TransformToPlaylist(TransformToAudiosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}