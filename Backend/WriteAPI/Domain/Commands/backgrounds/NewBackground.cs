using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class NewBackground : BaseCommandEntity, IRequest<Unit>
    {
        public IFormFile File { set; get; }
        public NewBackground(string email, IFormFile File)
            :base(email)
        {
            this.File = File;
        }
    }
}
