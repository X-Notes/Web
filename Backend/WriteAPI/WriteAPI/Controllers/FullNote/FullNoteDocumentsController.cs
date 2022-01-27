using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Documents;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/documents")]
    [ApiController]
    public class FullNoteDocumentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteDocumentsController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveDocument(UnlinkDocumentsCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpDelete("{noteId}/{contentId}/{documentId}")]
        public async Task<OperationResult<Unit>> RemoveDocumentFromCollection(Guid noteId, Guid contentId, Guid documentId)
        {
            var command = new RemoveDocumentFromCollectionCommand(noteId, contentId, documentId);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }


        [HttpPost("transform")]
        public async Task<OperationResult<DocumentsCollectionNoteDTO>> TransformToDocuments(TransformToDocumentsCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPatch("sync")]
        public async Task<OperationResult<Unit>> SyncTextContents(UpdateDocumentsContentsCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("info")]
        public async Task<OperationResult<Unit>> UpdateCollectionInfo(UpdateDocumentsCollectionInfoCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}