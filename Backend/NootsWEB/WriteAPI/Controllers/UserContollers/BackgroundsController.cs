using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Backgrounds;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.Backgrounds.Commands;
using Noots.Backgrounds.Queries;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.UserContollers;

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
    public async Task DefaultBackgroundCover()
    {
        await _mediator.Send(new DefaultBackgroundCommand(this.GetUserId()));
    }

    [HttpDelete("background/{id}")]
    public async Task DeleteBackground(Guid id)
    {
        await _mediator.Send(new RemoveBackgroundCommand(this.GetUserId(), id));
    }

    [HttpGet("background/{id}")]
    public async Task UpdateBackgroundCover(Guid id)
    {
        await _mediator.Send(new UpdateBackgroundCommand(this.GetUserId(), id));
    }

    [HttpPost("new")]
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
    public async Task<List<BackgroundDTO>> GetAll()
    {
        return await _mediator.Send(new GetUserBackgroundsQuery(this.GetUserId()));
    }
}