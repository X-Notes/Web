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


        public SetDeleteFolderCommand(string email) : base(email)
        {

        }
    }
}
