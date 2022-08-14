using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class SavePhotosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FilesBytes { set; get; }

        public Guid UserId { set; get; }

        public SavePhotosToNoteCommand(Guid userId, List<FilesBytes> photos)
        {
            FilesBytes = photos;
            UserId = userId;
        }

    }
}
