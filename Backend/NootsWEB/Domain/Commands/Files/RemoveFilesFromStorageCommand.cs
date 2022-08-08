using MediatR;
using System.Collections.Generic;

namespace Domain.Commands.Files
{
    public class RemoveFilesFromStorageCommand : IRequest<Unit>
    {
        public List<string> Pathes { set; get; }

        public string UserId { set; get; }

        public RemoveFilesFromStorageCommand(List<string> pathes, string userId)
        {
            Pathes = pathes;
            UserId = userId;
        }
    }
}
