using Common.DTO.Folders;
using MediatR;

namespace Domain.Commands.Folders
{
    public class NewFolderCommand : BaseCommandEntity, IRequest<SmallFolder>
    {
        public NewFolderCommand(string email): base(email)
        {

        }
    }
}
