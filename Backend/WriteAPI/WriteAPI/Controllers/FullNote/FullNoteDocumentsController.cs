using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Videos;
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

        [HttpPost("upload/{id}/{contentId}")]
        public async Task<OperationResult<List<DocumentNoteDTO>>> UploadDocumentsToCollection(List<IFormFile> documents, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            if (documents.Count == 0) // TODO MOVE TO FILTER
            {
                return new OperationResult<List<DocumentNoteDTO>>().SetNoAnyFile();
            }

            var results = documents.Select(document => this.ValidateFile<List<DocumentNoteDTO>>(document, SupportFileContentTypes.Documents));
            var result = results.FirstOrDefault(x => !x.Success);
            if (result != null)
            {
                return result;
            }

            var command = new UploadDocumentsToCollectionCommand(id, contentId, documents);
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command, cancellationToken);
        }

        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveDocument(UnlinkDocumentsCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("transform")]
        public async Task<OperationResult<DocumentsCollectionNoteDTO>> TransformToDocuments(TransformToDocumentsCollectionCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}