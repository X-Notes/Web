using Common.DatabaseModels.helpers;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShareController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ShareController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("folders/share/edit")]
        public async Task ToPublicEditShareFolders(ChangeRefTypeFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            command.RefType = RefType.Editor;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/share/view")]
        public async Task ToPublicViewShareFolders(ChangeRefTypeFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            command.RefType = RefType.Viewer;
            await this._mediator.Send(command);
        }


        [HttpPost("notes/share/edit")]
        public async Task ToPublicEditShareNotes(ChangeRefTypeNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            command.RefType = RefType.Editor;
            await this._mediator.Send(command);
        }

        [HttpPost("notes/share/view")]
        public async Task ToPublicViewShareNotes(ChangeRefTypeNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            command.RefType = RefType.Viewer;
            await this._mediator.Send(command);
        }
    }
}