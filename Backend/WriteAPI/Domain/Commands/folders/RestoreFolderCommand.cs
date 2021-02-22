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
        public List<Guid> Ids { set; get; }

        [Required]
        public Guid ToId { set; get; }

        public RestoreFolderCommand(string email): base(email)
        {
                
        }
    }
}
