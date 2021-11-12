using System.ComponentModel.DataAnnotations;
using Common.DTO;
using Common.DTO.Backgrounds;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.Backgrounds
{
    public class NewBackgroundCommand : BaseCommandEntity, IRequest<OperationResult<BackgroundDTO>>
    {
        [Required]
        public IFormFile File { set; get; }
        public NewBackgroundCommand(string email, IFormFile File)
            :base(email)
        {
            this.File = File;
        }
    }
}
