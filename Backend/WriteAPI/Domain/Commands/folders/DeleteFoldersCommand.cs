using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folders
{
    public class DeleteFoldersCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { set; get; }

        [Required]
        public Guid DeleteTypeId { set; get; }

        public DeleteFoldersCommand(string email): base(email)
        {

        }
    }
}
