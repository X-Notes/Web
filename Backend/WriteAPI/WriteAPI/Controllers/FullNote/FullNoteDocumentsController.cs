using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Documents;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers.FullNote
{
    [Authorize]
    [Route("api/note/inner/documents")]
    [ApiController]
    public class FullNoteDocumentsController : BaseNoteFileContentController
        <
        RemoveDocumentsFromCollectionCommand,
        AddDocumentsToCollectionCommand,
        UpdateDocumentsCollectionInfoCommand
        >
    {
        public FullNoteDocumentsController(IMediator _mediator) : base(_mediator)
        {
        }

        [HttpPost("transform")]
        public async Task<OperationResult<DocumentsCollectionNoteDTO>> TransformToDocuments(TransformToDocumentsCollectionCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }

}