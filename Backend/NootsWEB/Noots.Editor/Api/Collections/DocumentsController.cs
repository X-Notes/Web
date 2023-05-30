using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands.Documents;
using Noots.Editor.Queries;

namespace Noots.Editor.Api.Collections;

[Authorize]
[Route("api/note/inner/documents")]
[ApiController]
public class DocumentsController : BaseCollectionsController
<
    RemoveDocumentsFromCollectionCommand,
    AddDocumentsToCollectionCommand,
    UpdateDocumentsCollectionInfoCommand,
    GetNoteFilesByIdsQuery<DocumentNoteDTO>,
    DocumentNoteDTO
>
{
    public DocumentsController(IMediator _mediator) : base(_mediator)
    {
    }

    [HttpPost("transform")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<DocumentsCollectionNoteDTO>> TransformToDocuments(TransformToDocumentsCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}