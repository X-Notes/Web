using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Queries.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Controllers.FullNoteAPI;

namespace WriteAPI.Controllers.FullNoteAPI
{
    [Authorize]
    [Route("api/note/inner/documents")]
    [ApiController]
    public class FullNoteDocumentsController : BaseNoteFileContentController
        <
        RemoveDocumentsFromCollectionCommand,
        AddDocumentsToCollectionCommand,
        UpdateDocumentsCollectionInfoCommand,
        GetNoteFilesByIdsQuery<DocumentNoteDTO>,
        DocumentNoteDTO
        >
    {
        public FullNoteDocumentsController(IMediator _mediator) : base(_mediator)
        {
        }

        [HttpPost("transform")] // TODO TO WS
        public async Task<OperationResult<DocumentsCollectionNoteDTO>> TransformToDocuments(TransformToDocumentsCollectionCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }

}