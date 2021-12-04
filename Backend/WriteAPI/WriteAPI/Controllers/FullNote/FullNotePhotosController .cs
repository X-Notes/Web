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
    [Route("api/note/inner/photos")]
    [ApiController]
    public class FullNoteAlbumsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteAlbumsController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveAlbum(UnlinkPhotosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpDelete("{noteId}/{contentId}/{photoId}")]
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

        [HttpPatch("sync")]
        public async Task<OperationResult<Unit>> SyncTextContents(UpdatePhotosContentsCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }
    }

}