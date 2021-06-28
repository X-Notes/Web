using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Folders
{
    public class MakePrivateFolderCommand : BaseCommandEntity, IRequest<Unit> 
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public MakePrivateFolderCommand(string email) : base(email)
        {

        }
    }
}
