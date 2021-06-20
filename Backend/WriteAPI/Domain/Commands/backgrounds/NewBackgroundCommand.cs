using Common.DTO.backgrounds;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class NewBackgroundCommand : BaseCommandEntity, IRequest<BackgroundDTO>
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
