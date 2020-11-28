using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folders
{
    public class RestoreFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<string> Ids { set; get; }
        public RestoreFolderCommand(string email): base(email)
        {
                
        }
    }
}
