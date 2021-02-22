using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.folders
{
    public class CopyFolderCommand : BaseCommandEntity, IRequest<List<SmallFolder>>
    {
        [Required]
        public List<Guid> Ids { set; get; }


        [Required]
        public Guid ToId { set; get; }

        public CopyFolderCommand(string email): base(email)
        {

        }
    }
}
