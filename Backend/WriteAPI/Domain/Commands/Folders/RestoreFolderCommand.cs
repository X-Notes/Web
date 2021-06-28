using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Folders
{
    public class RestoreFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public RestoreFolderCommand(string email): base(email)
        {
                
        }
    }
}
