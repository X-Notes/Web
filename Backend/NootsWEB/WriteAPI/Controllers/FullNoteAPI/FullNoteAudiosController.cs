﻿using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Queries.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers.FullNoteAPI;

[Authorize]
[Route("api/note/inner/audios")]
[ApiController]
public class FullNoteAudiosController : BaseNoteFileContentController
<
    RemoveAudiosFromCollectionCommand, 
    AddAudiosToCollectionCommand,
    UpdateAudiosCollectionInfoCommand,
    GetNoteFilesByIdsQuery<AudioNoteDTO>,
    AudioNoteDTO
>
{

    public FullNoteAudiosController(IMediator _mediator) : base(_mediator)
    {
    }

    [HttpPost("transform")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<AudiosCollectionNoteDTO>> TransformToPlaylist(TransformToAudiosCollectionCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}