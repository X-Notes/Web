using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.folders
{
    public class SetDeleteFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        [Required]
        public Guid ToId { set; get; }

        public SetDeleteFolderCommand(string email) : base(email)
        {

        }
    }
}
