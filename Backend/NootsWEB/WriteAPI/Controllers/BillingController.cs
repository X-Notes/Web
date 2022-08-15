using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillingController : ControllerBase
    {
        private readonly IMediator _mediator;
        public BillingController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }
    }
}
