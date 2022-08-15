using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Common.DTO.Personalization;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Noots.Personalization.Commands;
using Noots.Personalization.Queries;

namespace WriteAPI.Controllers.UserContollers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PersonalizationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PersonalizationController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpGet]
        public async Task<PersonalizationSettingDTO> GetUserPersonalizationSettings()
        {
            var query = new GetUserPersonalizationSettingsQuery(this.GetUserId());
            return await _mediator.Send(query);
        }


        [HttpPatch]
        public async Task UpdateUserPersonalizationSettings(UpdatePersonalizationSettingsCommand command)
        {
            command.UserId = this.GetUserId();
            await _mediator.Send(command);
        }
    }
}
