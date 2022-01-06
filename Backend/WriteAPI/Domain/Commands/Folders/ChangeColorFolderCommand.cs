using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;
using Common.Attributes;
using Common.DTO;

namespace Domain.Commands.Folders
{
    public class ChangeColorFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public string Color { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }
        
        public ChangeColorFolderCommand(List<Guid> ids, string email, string color)
            : base(email)
        {
            this.Ids = ids;
            Color = color;
        }
    }
}
