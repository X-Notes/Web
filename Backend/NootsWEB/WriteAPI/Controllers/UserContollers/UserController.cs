using System;
using System.Threading.Tasks;
using Common.DTO;
using Domain.Queries.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.Storage.Queries;
using Noots.Users.Commands;
using Noots.Users.Entities;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.UserContollers
{
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


        [HttpPost]
        public async Task<OperationResult<ShortUser>> Authorize(NewUserCommand command)
        {
            command.Email = this.GetUserEmail();
            var userId = await _mediator.Send(command);
            return await _mediator.Send(new GetShortUserQuery(userId));
        }


        [HttpGet("short")]
        public async Task<OperationResult<ShortUser>> GetShort()
        {
            var userId = this.GetUserIdRaw();

            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedId)) {
                return new OperationResult<ShortUser>(false, null, OperationResultAdditionalInfo.NotFound);
            }

            return await _mediator.Send(new GetShortUserQuery(parsedId));
        }

        [HttpGet("memory")]
        public async Task<GetUserMemoryResponse> GetUsedDiskSpace()
        {
            return await _mediator.Send(new GetUserMemoryQuery(this.GetUserId()));
        }

        [HttpPut("info")]
        public async Task UpdateMainInformation([FromBody] UpdateMainUserInfoCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }

        [HttpPost("photo")]
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
        public async Task ChangeLanguage(UpdateLanguageCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }

        [HttpPost("theme")]
        public async Task ChangeTheme(UpdateThemeCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }

        [HttpPost("font")]
        public async Task ChangeFontSize(UpdateFontSizeCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }
    }
}