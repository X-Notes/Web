﻿using Common;
using Common.ConstraintsUploadFiles;
using Common.DTO;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Storage.Queries;
using Users.Commands;
using Users.Entities;
using Users.Queries;

namespace Users.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    public UserController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }


    [HttpGet("short/{id}")]
    [AllowAnonymous]
    public async Task<OperationResult<ShortUser>> GetOne(Guid id)
    {
        return await _mediator.Send(new GetUserShortDTOQuery(id));
    }

    [HttpGet("short")]
    public async Task<OperationResult<UserDTO>> GetShort()
    {
        var userId = this.GetUserIdRaw();

        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedId))
        {
            return new OperationResult<UserDTO>(false, null, OperationResultAdditionalInfo.NotFound);
        }

        return await _mediator.Send(new GetUserDTOQuery(parsedId));
    }

    [HttpGet("memory")]
    [ValidationRequireUserIdFilter]
    public async Task<GetUserMemoryResponse> GetUsedDiskSpace()
    {
        return await _mediator.Send(new GetUserMemoryQuery(this.GetUserId()));
    }

    [HttpPut("info")]
    [ValidationRequireUserIdFilter]
    public async Task UpdateMainInformation([FromBody] UpdateMainUserInfoCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }

    [HttpPost("photo")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<AnswerChangeUserPhoto>> ChangeProfilePhoto(IFormFile photo)
    {
        var validatioResult = this.ValidateFile<AnswerChangeUserPhoto>(photo, SupportFileContentTypes.Photos, FileSizeConstraints.MaxProfilePhotoSize);
        if (!validatioResult.Success)
        {
            return validatioResult;
        }

        return await _mediator.Send(new UpdatePhotoCommand(photo, this.GetUserId()));
    }

    [HttpPost("language")]
    [ValidationRequireUserIdFilter]
    public async Task ChangeLanguage(UpdateLanguageCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }

    [HttpPost("theme")]
    [ValidationRequireUserIdFilter]
    public async Task ChangeTheme(UpdateThemeCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }

    [HttpPost("font")]
    [ValidationRequireUserIdFilter]
    public async Task ChangeFontSize(UpdateFontSizeCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }
}