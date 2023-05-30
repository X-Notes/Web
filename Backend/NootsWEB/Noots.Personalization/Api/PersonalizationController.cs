using MediatR;
using Microsoft.AspNetCore.Mvc;
using Common.DTO;
using Common.DTO.Personalization;
using Microsoft.AspNetCore.Authorization;
using Noots.Personalization.Commands;
using Noots.Personalization.Queries;
using Common;
using Common.Filters;

namespace Noots.Personalization.Api;

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
    [ValidationRequireUserIdFilter]
    public async Task<PersonalizationSettingDTO> GetUserPersonalizationSettings()
    {
        var query = new GetUserPersonalizationSettingsQuery(this.GetUserId());
        return await _mediator.Send(query);
    }


    [HttpPatch]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateUserPersonalizationSettings(UpdatePersonalizationSettingsCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}