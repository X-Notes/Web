using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Photos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNote
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
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}