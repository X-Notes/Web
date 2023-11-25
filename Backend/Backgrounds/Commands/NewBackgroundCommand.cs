using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Backgrounds;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Backgrounds.Commands
{
    public class NewBackgroundCommand : BaseCommandEntity, IRequest<OperationResult<BackgroundDTO>>
    {
        [Required]
        public IFormFile File { set; get; }

        public NewBackgroundCommand(Guid userId, IFormFile File)
            :base(userId)
        {
            this.File = File;
        }
    }
}
