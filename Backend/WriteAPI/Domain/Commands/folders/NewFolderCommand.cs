using Common.DTO.folders;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.folders
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<SmallFolder>
    {
        [Required]
        public Guid TypeId { set; get; }
        public NewFolderCommand(string email): base(email)
        {

        }
    }
}
