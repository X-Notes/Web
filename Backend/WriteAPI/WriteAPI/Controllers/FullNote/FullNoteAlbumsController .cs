using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Photos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/album")]
    [ApiController]
    public class FullNoteAlbumsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteAlbumsController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveAlbum(RemovePhotosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("upload/{id}/{contentId}")]
        public async Task<OperationResult<List<PhotoNoteDTO>>> UploadPhotosToCollection(List<IFormFile> photos, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (photos.Count == 0)
            {
                return new OperationResult<List<PhotoNoteDTO>>().SetNoAnyFile();
            }

            var results = photos.Select(photo => this.ValidateFile<List<PhotoNoteDTO>>(photo, SupportFileContentTypes.Photos));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadPhotosToCollectionCommand(id, contentId, photos);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command, cancellationToken);
        }

        [HttpDelete("photo/{noteId}/{contentId}/{photoId}")]
        public async Task<OperationResult<Unit>> RemovePhotoFromAlbum(Guid noteId, Guid contentId, Guid photoId)
        {
            var command = new RemovePhotoFromCollectionCommand(noteId, contentId, photoId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("row/count")]
        public async Task<OperationResult<Unit>> ChangeAlbumCountRow(ChangePhotosCollectionRowCountCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("size")]
        public async Task<OperationResult<Unit>> ChangeAlbumSize(ChangePhotosCollectionSizeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpPost("transform")]
        public async Task<OperationResult<PhotosCollectionNoteDTO>> TransformToAlbum(TransformToPhotosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}