using Common.DTO.personalization;
using Domain.Commands.personalizations;
using Domain.Queries.personalization;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
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
            var query = new GetUserPersonalizationSettingsQuery(this.GetUserEmail());
            return await _mediator.Send(query);
        }


        [HttpPatch]
        public async Task UpdateUserPersonalizationSettings(UpdatePersonalizationSettingsCommand command)
        {
            command.Email = this.GetUserEmail();
            await _mediator.Send(command);
        }
    }
}
