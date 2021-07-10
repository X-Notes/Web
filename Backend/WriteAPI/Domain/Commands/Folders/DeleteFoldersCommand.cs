using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Folders
{
    public class DeleteFoldersCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        public DeleteFoldersCommand(string email): base(email)
        {

        }
    }
}
