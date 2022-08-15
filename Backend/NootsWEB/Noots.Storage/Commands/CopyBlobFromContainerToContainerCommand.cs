using Common.DatabaseModels.Models.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class CopyBlobFromContainerToContainerCommand : IRequest<AppFile>
    {
        public Guid UserFromId { set; get; }

        public Guid UserToId { set; get; }

        public AppFile AppFile { set; get; }

        public ContentTypesFile ContentTypesFile { set; get; }

        public CopyBlobFromContainerToContainerCommand(
            Guid userFromId,
            Guid userToId,
            AppFile appFile,
            ContentTypesFile contentTypesFile)
        {
            UserFromId = userFromId;
            UserToId = userToId;
            ContentTypesFile = contentTypesFile;
            AppFile = appFile;
        }
    }
}
