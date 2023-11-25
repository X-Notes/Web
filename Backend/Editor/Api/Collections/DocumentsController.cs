using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using Editor.Commands.Documents;
using Editor.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Collections;

[Authorize]
[Route("api/editor/documents")]
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