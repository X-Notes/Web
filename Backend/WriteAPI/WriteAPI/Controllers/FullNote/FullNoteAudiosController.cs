using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Audios;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/audios")]
    [ApiController]
    public class FullNoteAudiosController : ControllerBase
    {

        private readonly IMediator _mediator;

        public FullNoteAudiosController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemovePlaylist(RemoveAudiosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpDelete("{noteId}/{contentId}/{audioFileId}")]
        public async Task<OperationResult<Unit>> RemoveAudioFromPlaylist(Guid noteId, Guid contentId, Guid audioFileId)
        {
            var command = new RemoveAudioFromCollectionCommand(noteId, contentId, audioFileId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpPost("upload/{id}/{contentId}")]
        public async Task<OperationResult<List<AudioNoteDTO>>> UploadAudiosToCollection(List<IFormFile> audios, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (audios.Count == 0) // TODO MOVE TO FILTER
            {
                return new OperationResult<List<AudioNoteDTO>>().SetNoAnyFile();
            }

            var results = audios.Select(audio => this.ValidateFile<List<AudioNoteDTO>>(audio, SupportFileContentTypes.Audios));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadAudiosToCollectionCommand(id, contentId, audios);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command, cancellationToken);        
        }


        [HttpPatch("name")]
        public async Task<OperationResult<Unit>> ChangePlaylistName(ChangeNameAudiosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpPost("transform")]
        public async Task<OperationResult<AudiosCollectionNoteDTO>> TransformToPlaylist(TransformToAudiosCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}