using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Albums;
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


        [HttpPost("{id}/{contentId}")]
        public async Task<OperationResult<AlbumNoteDTO>> InsertAlbum(List<IFormFile> photos, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (photos.Count == 0)
            {
                return new OperationResult<AlbumNoteDTO>().SetNoAnyFile();
            }

            var results = photos.Select(photo => this.ValidateFile<AlbumNoteDTO>(photo, SupportFileContentTypes.Photos));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new InsertAlbumToNoteCommand(photos, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command, cancellationToken);
        }

        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveAlbum(RemoveAlbumCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("upload/{id}/{contentId}")]
        public async Task<OperationResult<List<AlbumPhotoDTO>>> UploadPhotoToAlbum(List<IFormFile> photos, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (photos.Count == 0)
            {
                return new OperationResult<List<AlbumPhotoDTO>>().SetNoAnyFile();
            }

            var results = photos.Select(photo => this.ValidateFile<List<AlbumPhotoDTO>>(photo, SupportFileContentTypes.Photos));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadPhotosToAlbumCommand(id, contentId, photos);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command, cancellationToken);
        }

        [HttpDelete("photo/{noteId}/{contentId}/{photoId}")]
        public async Task<OperationResult<Unit>> RemovePhotoFromAlbum(Guid noteId, Guid contentId, Guid photoId)
        {
            var command = new RemovePhotoFromAlbumCommand(noteId, contentId, photoId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("row/count")]
        public async Task<OperationResult<Unit>> ChangeAlbumCountRow(ChangeAlbumRowCountCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("size")]
        public async Task<OperationResult<Unit>> ChangeAlbumSize(ChangeAlbumSizeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

    }

}