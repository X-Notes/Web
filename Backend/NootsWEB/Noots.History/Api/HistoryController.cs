using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO;
using Noots.History.Entities;
using Noots.History.Queries;
using Common;
using Common.Filters;

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
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<NoteHistoryDTO>>> GetHistories(Guid noteId)
    {
        return await mediator.Send(new GetNoteHistoriesQuery(noteId, this.GetUserId()));
    }

    [HttpGet("snapshot/{noteId}/{snapshotId}")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<NoteHistoryDTOAnswer>> GetSnapshot(Guid noteId, Guid snapshotId)
    {
        return await mediator.Send(new GetNoteSnapshotQuery(snapshotId, noteId, this.GetUserId()));
    }

    [HttpGet("snapshot/contents/{noteId}/{snapshotId}")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetSnapshotContent(Guid noteId, Guid snapshotId)
    {
        var command = new GetSnapshotContentsQuery(this.GetUserId(), noteId, snapshotId);
        return await mediator.Send(command);
    }
}