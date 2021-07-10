using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Folders
{
    public class ArchiveFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public ArchiveFolderCommand(string email) : base(email)
        {

        }
    }
}
