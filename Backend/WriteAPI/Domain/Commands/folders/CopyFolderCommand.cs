using Common.DatabaseModels.helpers;
using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folders
{
    public class CopyFolderCommand : BaseCommandEntity, IRequest<List<SmallFolder>>
    {
        [Required]
        public List<string> Ids { set; get; }
        public CopyFolderCommand(string email): base(email)
        {

        }
    }
}
