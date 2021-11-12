using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Backgrounds;
using Domain.Commands.Backgrounds;
using Domain.Queries.Backgrounds;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.UserContollers
{
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
            var email = this.GetUserEmail();
            await _mediator.Send(new DefaultBackgroundCommand(email));
        }

        [HttpDelete("background/{id}")]
        public async Task DeleteBackground(Guid id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new RemoveBackgroundCommand(email, id));
        }

        [HttpGet("background/{id}")]
        public async Task UpdateBackgroundCover(Guid id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new UpdateBackgroundCommand(email, id));
        }

        [HttpPost("new")]
        public async Task<OperationResult<BackgroundDTO>> NewBackgroundPhoto(IFormFile photo)
        {
            var validatioResult = this.ValidateFile<BackgroundDTO>(photo, SupportFileContentTypes.Photos, FileSizeConstraints.MaxBackgroundPhotoSize);
            if (!validatioResult.Success)
            {
                return validatioResult;
            }

            var email = this.GetUserEmail();
            return await _mediator.Send(new NewBackgroundCommand(email, photo));
        }

        [HttpGet]
        public async Task<List<BackgroundDTO>> GetAll()
        {
            var email = this.GetUserEmail();
            return await _mediator.Send(new GetUserBackgroundsQuery(email));
        }
    }
}