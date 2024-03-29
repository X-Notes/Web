﻿using Backgrounds.Commands;
using Backgrounds.Queries;
using Common;
using Common.ConstraintsUploadFiles;
using Common.DTO;
using Common.DTO.Backgrounds;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backgrounds.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class BackgroundsController : ControllerBase
{
    private readonly IMediator _mediator;
    public BackgroundsController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpGet("background/default")]
    [ValidationRequireUserIdFilter]
    public async Task DefaultBackgroundCover()
    {
        await _mediator.Send(new DefaultBackgroundCommand(this.GetUserId()));
    }

    [HttpDelete("background/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task DeleteBackground(Guid id)
    {
        await _mediator.Send(new RemoveBackgroundCommand(this.GetUserId(), id));
    }

    [HttpGet("background/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task UpdateBackgroundCover(Guid id)
    {
        await _mediator.Send(new UpdateBackgroundCommand(this.GetUserId(), id));
    }

    [HttpPost("new")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<BackgroundDTO>> NewBackgroundPhoto(IFormFile photo)
    {
        var validatioResult = this.ValidateFile<BackgroundDTO>(photo, SupportFileContentTypes.Photos, FileSizeConstraints.MaxBackgroundPhotoSize);
        if (!validatioResult.Success)
        {
            return validatioResult;
        }
        return await _mediator.Send(new NewBackgroundCommand(this.GetUserId(), photo));
    }

    [HttpGet]
    [ValidationRequireUserIdFilter]
    public async Task<List<BackgroundDTO>> GetAll()
    {
        return await _mediator.Send(new GetUserBackgroundsQuery(this.GetUserId()));
    }
}