using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folders
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
