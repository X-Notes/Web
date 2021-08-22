using System;
using System.Threading;
using System.Threading.Tasks;
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


        [HttpPost("{id}/{contentId}")]
        public async Task<OperationResult<DocumentNoteDTO>> InsertDocuments(IFormFile file, Guid id, Guid contentId, CancellationToken cancellationToken)
        {
            var validatioResult = this.ValidateFile<DocumentNoteDTO>(file, SupportFileContentTypes.Documents);
            if (!validatioResult.Success)
            {
                return validatioResult;
            }

            var command = new InsertDocumentsToNoteCommand(file, id, contentId);
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command, cancellationToken);
        }


        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveDocument(RemoveDocumentCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }
    }

}