using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Models;
using MediatR;
using Storage.Entities;

namespace Storage.Commands
{
    public class CopyBlobFromContainerToContainerCommand : IRequest<(bool success, AppFile file)>
    {
        public StoragesEnum StorageFromId { set; get; }
        public Guid UserFromId { set; get; }

        public StoragesEnum StorageToId { set; get; }
        public Guid UserToId { set; get; }

        public AppFile AppFile { set; get; }

        public ContentTypesFile ContentTypesFile { set; get; }

        public CopyBlobFromContainerToContainerCommand(
            StoragesEnum storageFromId,
            Guid userFromId,
            StoragesEnum storageToId,
            Guid userToId,
            AppFile appFile,
            ContentTypesFile contentTypesFile)
        {
            StorageFromId = storageFromId;
            UserFromId = userFromId;

            UserToId = userToId;
            StorageToId = storageToId;

            ContentTypesFile = contentTypesFile;
            AppFile = appFile;
        }
    }
}
