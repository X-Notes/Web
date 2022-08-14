using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class SaveBackgroundCommand : IRequest<AppFile>
    {
        public FilesBytes FileBytes { set; get; }

        public Guid UserId { set; get; }

        public SaveBackgroundCommand(Guid userId, FilesBytes fileBytes)
        {
            FileBytes = fileBytes;
            UserId = userId;
        }
    }
}
