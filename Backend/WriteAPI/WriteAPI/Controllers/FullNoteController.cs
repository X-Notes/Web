using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.noteInner;
using Domain.Commands.noteInner.fileContent.albums;
using Domain.Commands.noteInner.fileContent.audios;
using Domain.Commands.noteInner.fileContent.files;
using Domain.Commands.noteInner.fileContent.videos;
using Domain.Queries.notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FullNoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPatch("title")]
        public async Task ChangeColor([FromBody]UpdateTitleNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("text/type")]
        public async Task<OperationResult<Unit>> UpdateType(TransformTextTypeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("text")]
        public async Task UpdateText(UpdateTextNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            await this._mediator.Send(command);
        }


        // CONTENT
        // TEXT
        [HttpPost("content/concat")]
        public async Task<OperationResult<TextNoteDTO>> ConcatLine(ConcatWithPreviousCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("content/remove")]
        public async Task<OperationResult<Unit>> RemoveLine(RemoveContentCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("content/insert")]
        public async Task<OperationResult<TextNoteDTO>> InsertLine(InsertLineCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("content/new")]
        public async Task<OperationResult<TextNoteDTO>> NewLine(NewLineTextContentNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpGet("contents/{id}")]
        public async Task<List<BaseContentNoteDTO>> GetNoteContent(Guid id)
        {
            var email = this.GetUserEmail();
            var command = new GetNoteContentsQuery(email, id);
            return await this._mediator.Send(command);
        }

        // ALBUM

        [HttpPost("album/{id}/{contentId}")]
        public async Task<OperationResult<AlbumNoteDTO>> InsertAlbum(List<IFormFile> photos, Guid id, Guid contentId)
        {
            if (photos.Count > 0)
            {
                var command = new InsertAlbumToNoteCommand(photos, id, contentId);
                command.Email = this.GetUserEmail();
                return await this._mediator.Send(command);
            }
            throw new Exception("Files can`t be empty");
        }

        [HttpPost("album/remove")]
        public async Task<OperationResult<Unit>> RemoveAlbum(RemoveAlbumCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("album/upload/{id}/{contentId}")]
        public async Task<OperationResult<List<Guid>>> UploadPhotoToAlbum(List<IFormFile> photos, Guid id, Guid contentId)
        {
            if (photos.Count > 0)
            {
                var command = new UploadPhotosToAlbum(id, contentId, photos);
                command.Email = this.GetUserEmail();
                return await _mediator.Send(command);
            }
            throw new Exception("Files can`t be empty");
        }

        [HttpDelete("album/photo/{noteId}/{contentId}/{photoId}")]
        public async Task<OperationResult<Unit>> RemovePhotoFromAlbum(Guid noteId, Guid contentId, Guid photoId)
        {
            var command = new RemovePhotoFromAlbumCommand(noteId, contentId, photoId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("album/row/count")]
        public async Task<OperationResult<Unit>> ChangeAlbumCountRow(ChangeAlbumRowCountCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("album/size")]
        public async Task<OperationResult<Unit>> ChangeAlbumSize(ChangeAlbumSizeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        // AUDIO

        [HttpPost("audios/{id}/{contentId}")]
        public async Task<OperationResult<Unit>> InsertAudios(List<IFormFile> audios, Guid id, Guid contentId)
        {
            if(audios.Count > 0)
            {
                var command = new InsertAudiosToNoteCommand(audios, id, contentId);
                command.Email = this.GetUserEmail();
                return await this._mediator.Send(command);
            }
            throw new Exception("Files can`t be empty");
        }

        [HttpPost("videos/{id}/{contentId}")]
        public async Task<OperationResult<Unit>> InsertVideos(List<IFormFile> videos, Guid id, Guid contentId)
        {
            if (videos.Count > 0)
            {
                var command = new InsertVideosToNoteCommand(videos, id, contentId);
                command.Email = this.GetUserEmail();
                return await this._mediator.Send(command);
            }
            throw new Exception("Files can`t be empty");
        }

        [HttpPost("files/{id}/{contentId}")]
        public async Task<OperationResult<Unit>> InsertFiles(List<IFormFile> files, Guid id, Guid contentId)
        {
            if (files.Count > 0)
            {
                Console.WriteLine(files);
                var command = new InsertFilesToNoteCommand(files, id, contentId);
                command.Email = this.GetUserEmail();
                return await this._mediator.Send(command);
            }
            throw new Exception("Files can`t be empty");
        }


    }

}