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
        public async Task<IActionResult> GetPhotoById(Guid id)
        {
            var bytes = await _mediator.Send(new GetFileById(id));
            if (bytes != null)
            {
                return File(bytes.Bytes, bytes.ContentType);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("audio/{id}")]
        public async Task<IActionResult> GetAudioById(Guid id)
        {
            var bytes = await _mediator.Send(new GetFileById(id));
            if (bytes != null)
            {
                var resp =  File(bytes.Bytes, bytes.ContentType);
                resp.EnableRangeProcessing = true;
                return resp;
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("video/{id}")]
        public async Task<IActionResult> GetVideoById(Guid id)
        {
            var bytes = await _mediator.Send(new GetFileById(id));
            if (bytes != null)
            {
                var resp = File(bytes.Bytes, bytes.ContentType);
                resp.EnableRangeProcessing = true;
                return resp;
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("document/{id}")]
        public async Task<IActionResult> GetDocumentById(Guid id)
        {
            var bytes = await _mediator.Send(new GetFileById(id));
            if (bytes != null)
            {
                var resp = File(bytes.Bytes, bytes.ContentType);
                return resp;
            }
            else
            {
                return NotFound();
            }
        }
    }
}
