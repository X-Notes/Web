using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Backgrounds;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Users;
using Domain.Commands.NoteInner;
using Domain.Commands.NoteInner.FileContent.Albums;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;
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
        public async Task<OperationResult<Unit>> ChangeColor([FromBody]UpdateTitleNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }


        [HttpPatch("text/type")]
        public async Task<OperationResult<Unit>> UpdateType(TransformTextTypeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("text")]
        public async Task<OperationResult<Unit>> UpdateText(UpdateTextNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
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

        [HttpGet("contents/{noteId}")]
        public async Task<List<BaseContentNoteDTO>> GetNoteContent(Guid noteId)
        {
            var email = this.GetUserEmail();
            var command = new GetNoteContentsQuery(email, noteId);
            return await this._mediator.Send(command);
        }


        // ALBUM

        [HttpPost("album/{id}/{contentId}")]
        public async Task<OperationResult<AlbumNoteDTO>> InsertAlbum(List<IFormFile> photos, Guid id, Guid contentId)
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
            return await this._mediator.Send(command);
        }

        [HttpPost("album/remove")]
        public async Task<OperationResult<Unit>> RemoveAlbum(RemoveAlbumCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("album/upload/{id}/{contentId}")]
        public async Task<OperationResult<List<AlbumPhotoDTO>>> UploadPhotoToAlbum(List<IFormFile> photos, Guid id, Guid contentId)
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
            return await _mediator.Send(command);
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
        public async Task<OperationResult<AudiosPlaylistNoteDTO>> InsertAudios(List<IFormFile> audios, Guid id, Guid contentId)
        {
            if (audios.Count == 0)
            {
                return new OperationResult<AudiosPlaylistNoteDTO>().SetNoAnyFile();
            }

            var results = audios.Select(audio => this.ValidateFile<AudiosPlaylistNoteDTO>(audio, SupportFileContentTypes.Audios));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new InsertAudiosToNoteCommand(audios, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("audios/remove")]
        public async Task<OperationResult<Unit>> RemovePlaylist(RemovePlaylistCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpDelete("audios/{noteId}/{contentId}/{audioFileId}")]
        public async Task<OperationResult<Unit>> RemoveAudioFromPlaylist(Guid noteId, Guid contentId, Guid audioFileId)
        {
            var command = new RemoveAudioCommand(noteId, contentId, audioFileId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("audios/upload/{id}/{contentId}")]
        public async Task<OperationResult<List<AudioNoteDTO>>> UploadAudiosToPlaylist(List<IFormFile> audios, Guid id, Guid contentId)
        {
            if (audios.Count == 0)
            {
                return new OperationResult<List<AudioNoteDTO>>().SetNoAnyFile();
            }

            var results = audios.Select(audio => this.ValidateFile<List<AudioNoteDTO>>(audio, SupportFileContentTypes.Audios));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadAudiosToPlaylistCommand(id, contentId, audios);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);        
        }

        [HttpPatch("audios/name")]
        public async Task<OperationResult<Unit>> ChangePlaylistName(ChangeNamePlaylistCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        // VIDEOS

        [HttpPost("videos/{id}/{contentId}")]
        public async Task<OperationResult<VideoNoteDTO>> InsertVideos(IFormFile video, Guid id, Guid contentId)
        {
            var validatioResult = this.ValidateFile<VideoNoteDTO>(video, SupportFileContentTypes.Videos);
            if (!validatioResult.Success)
            {
                return validatioResult;
            }

            var command = new InsertVideosToNoteCommand(video, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }


        [HttpPost("videos/remove")]
        public async Task<OperationResult<Unit>> RemoveVideo(RemoveVideoCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        // DOCUMENTS

        [HttpPost("files/{id}/{contentId}")]
        public async Task<OperationResult<DocumentNoteDTO>> InsertFiles(IFormFile file, Guid id, Guid contentId)
        {
            var validatioResult = this.ValidateFile<DocumentNoteDTO>(file, SupportFileContentTypes.Documents);
            if (!validatioResult.Success)
            {
                return validatioResult;
            }

            var command = new InsertDocumentsToNoteCommand(file, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }


        [HttpPost("files/remove")]
        public async Task<OperationResult<Unit>> RemoveDocument(RemoveDocumentCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpGet("users/{id}")]
        public async Task<List<OnlineUserOnNote>> GetOnlineUsersByNoteId(Guid id)
        {
            var query = new GetOnlineUsersOnNoteQuery(id);
            query.Email = this.GetUserEmail();
            return await _mediator.Send(query);
        }

    }

}