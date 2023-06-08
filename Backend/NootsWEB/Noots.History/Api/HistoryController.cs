using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO;
using Noots.History.Entities;
using Noots.History.Queries;
using Common;

namespace Noots.History.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class HistoryController : ControllerBase
{
    private readonly IMediator mediator;
    public HistoryController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [HttpGet("{noteId}")]
    [AllowAnonymous]
    public async Task<OperationResult<List<NoteHistoryDTO>>> GetHistories(Guid noteId)
    {
        return await mediator.Send(new GetNoteHistoriesQuery(noteId, this.GetUserIdUnStrict()));
    }

    [HttpGet("snapshot/{noteId}/{snapshotId}")]
    [AllowAnonymous]
    public async Task<OperationResult<NoteHistoryDTOAnswer>> GetSnapshot(Guid noteId, Guid snapshotId)
    {
        return await mediator.Send(new GetNoteSnapshotQuery(snapshotId, noteId, this.GetUserIdUnStrict()));
    }

    [HttpGet("snapshot/contents/{noteId}/{snapshotId}")]
    [AllowAnonymous]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetSnapshotContent(Guid noteId, Guid snapshotId)
    {
        var command = new GetSnapshotContentsQuery(this.GetUserIdUnStrict(), noteId, snapshotId);
        return await mediator.Send(command);
    }
}