using Common.DTO.folders;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.folders
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<SmallFolder>
    {
        public NewFolderCommand(string email): base(email)
        {

        }
    }
}
