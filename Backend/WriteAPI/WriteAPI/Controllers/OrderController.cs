using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Orders;
using Domain.Commands.Orders;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrderController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost]
        public async Task<List<UpdateOrderEntityResponse>> UpdateEntityOrder(UpdateOrderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }
    }
}