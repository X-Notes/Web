﻿using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Folders.AdditionalContent;
using Common.DTO.Personalization;
using Common.Filters;
using Folders.Commands;
using Folders.Commands.Sync;
using Folders.Entities;
using Folders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Folders.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class FolderController(IMediator mediator) : ControllerBase
{
    [HttpGet("new")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<SmallFolder>> Add()
    {
        var command = new NewFolderCommand(this.GetUserId());
        return await mediator.Send(command);
    }

    [HttpGet("type/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task<List<SmallFolder>> GetFolders(FolderTypeENUM id, [FromQuery] PersonalizationSettingDTO settings)
    {
        var query = new GetFoldersByTypeQuery(this.GetUserId(), id, settings);
        return await mediator.Send(query);
    }


    [HttpPost("many")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<SmallFolder>>> GetFoldersByIds(GetFoldersByFolderIdsQuery query)
    {
        query.UserId = this.GetUserId();
        return await mediator.Send(query);
    }

    [HttpGet("count")]
    [ValidationRequireUserIdFilter]
    public async Task<List<FoldersCount>> GetFoldersCountAsync()
    {
        var query = new GetFoldersCountQuery();
        query.UserId = this.GetUserId();
        return await mediator.Send(query);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<OperationResult<FullFolder>> Get(Guid id)
    {
        var query = new GetFullFolderQuery(this.GetUserIdUnStrict(), id);
        return await mediator.Send(query);
    }

    [HttpPatch("sync/state")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<SyncFolderResult>> SyncFolderState(SyncFolderStateCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    // Commands

    [HttpPatch("archive")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ArchiveFolder([FromBody] ArchiveFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("delete")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<Guid>>> SetDeleteNotes([FromBody] SetDeleteFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("ref/private")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> MakePrivate([FromBody] MakePrivateFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }


    [HttpPatch("color")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ChangeColor([FromBody] ChangeColorFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("copy")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<CopyFoldersResult>> CopyFolder([FromBody] CopyFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("delete/permanently")]
    [ValidationRequireUserIdFilter]
    public async Task DeleteNotes([FromBody] DeleteFoldersCommand command)
    {
        command.UserId = this.GetUserId();
        await mediator.Send(command);
    }

    [HttpPost("additional")]
    [ValidationRequireUserIdFilter]
    public async Task<List<BottomFolderContent>> GetAdditionalInfo(GetAdditionalContentFolderInfoQuery query)
    {
        query.UserId = this.GetUserId();
        return await mediator.Send(query);
    }

    [HttpPatch("order")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateOrder(UpdatePositionsFoldersCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }
}