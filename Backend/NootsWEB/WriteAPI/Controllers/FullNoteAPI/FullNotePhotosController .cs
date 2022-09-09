using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Queries.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers.FullNoteAPI;

[Authorize]
[Route("api/note/inner/photos")]
[ApiController]
public class FullNotePhotosController : BaseNoteFileContentController
<
    RemovePhotosFromCollectionCommand,
    AddPhotosToCollectionCommand,
    UpdatePhotosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<PhotoNoteDTO>,
    PhotoNoteDTO
>
{
    public FullNotePhotosController(IMediator _mediator) : base(_mediator)
    {
    }


    [HttpPost("transform")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<PhotosCollectionNoteDTO>> TransformToAlbum(TransformToPhotosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}