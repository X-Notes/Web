using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using Editor.Commands.Photos;
using Editor.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Collections;

[Authorize]
[Route("api/editor/photos")]
[ApiController]
public class PhotosController : BaseCollectionsController
<
    RemovePhotosFromCollectionCommand,
    AddPhotosToCollectionCommand,
    UpdatePhotosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<PhotoNoteDTO>,
    PhotoNoteDTO
>
{
    public PhotosController(IMediator _mediator) : base(_mediator)
    {
    }


    [HttpPost("transform")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<PhotosCollectionNoteDTO>> TransformToAlbum(TransformToPhotosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}