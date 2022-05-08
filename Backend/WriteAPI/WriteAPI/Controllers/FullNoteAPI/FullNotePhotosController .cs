using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Photos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Controllers.FullNoteAPI;

namespace WriteAPI.Controllers.FullNoteAPI
{
    [Authorize]
    [Route("api/note/inner/photos")]
    [ApiController]
    public class FullNoteAlbumsController : BaseNoteFileContentController
        <
        RemovePhotosFromCollectionCommand,
        AddPhotosToCollectionCommand,
        UpdatePhotosCollectionInfoCommand
        >
    {
        public FullNoteAlbumsController(IMediator _mediator) : base(_mediator)
        {
        }


        [HttpPost("transform")]
        public async Task<OperationResult<PhotosCollectionNoteDTO>> TransformToAlbum(TransformToPhotosCollectionCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }

}