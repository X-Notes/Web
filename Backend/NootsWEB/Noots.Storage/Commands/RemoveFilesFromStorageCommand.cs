using Common.DatabaseModels.Models.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class RemoveFilesFromStorageCommand : IRequest<Unit>
    {
        public List<AppFile> Files { set; get; }

        public string UserId { set; get; }

        public RemoveFilesFromStorageCommand(List<AppFile> files, string userId)
        {
            Files = files;
            UserId = userId;
        }
    }
}
