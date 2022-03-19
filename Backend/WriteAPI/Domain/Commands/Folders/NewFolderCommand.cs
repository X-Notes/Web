using Common.DTO.Folders;
using MediatR;
using System;

namespace Domain.Commands.Folders
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<SmallFolder>
    {
        public NewFolderCommand(Guid userId) : base(userId)
        {

        }
    }
}
