using BI.helpers;
using Domain.Queries.files;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly PhotoHelpers photoHelpers;
        private readonly IMediator _mediator;
        public FilesController(PhotoHelpers photoHelpers, IMediator _mediator)
        {
            this.photoHelpers = photoHelpers;
            this._mediator = _mediator;
        }


        [HttpGet("image/{id}")]
        public async Task<IActionResult> GetPhotoByUrl(Guid id)
        {
            var bytes = await _mediator.Send(new GetPhotoById(id));
            if (bytes != null)
            {
                return File(bytes.Bytes, bytes.ContentType);
            }
            else
            {
                return NotFound();
            }
        }
    }
}
