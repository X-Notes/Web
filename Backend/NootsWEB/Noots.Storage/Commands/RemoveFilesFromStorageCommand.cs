using MediatR;

namespace Noots.Storage.Commands
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
