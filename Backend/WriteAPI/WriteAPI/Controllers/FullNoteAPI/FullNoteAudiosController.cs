using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Audios;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Controllers.FullNoteAPI;

namespace WriteAPI.Controllers.FullNoteAPI
{
    [Authorize]
    [Route("api/note/inner/audios")]
    [ApiController]
    public class FullNoteAudiosController : BaseNoteFileContentController
        <
        RemoveAudiosFromCollectionCommand, 
        AddAudiosToCollectionCommand,
        UpdateAudiosCollectionInfoCommand
        >
    {

        public FullNoteAudiosController(IMediator _mediator) : base(_mediator)
        {
        }

        [HttpPost("transform")]
        public async Task<OperationResult<AudiosCollectionNoteDTO>> TransformToPlaylist(TransformToAudiosCollectionCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }

}