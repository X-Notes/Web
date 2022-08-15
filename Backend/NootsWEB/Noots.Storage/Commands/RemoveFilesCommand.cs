using Common.DatabaseModels.Models.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class RemoveFilesCommand : IRequest<Unit>
    {
        public List<AppFile> AppFiles { set; get; }

        public string UserId { set; get; }

        public RemoveFilesCommand(string userId, List<AppFile> appFiles)
        {
            AppFiles = appFiles;
            UserId = userId;
        }

        public RemoveFilesCommand(string userId, AppFile appFile)
        {
            AppFiles = new List<AppFile> { appFile };
            UserId = userId;
        }
    }
}
