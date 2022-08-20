using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Noots.Storage.Commands
{
    public class SaveDocumentsToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FileBytes { set; get; }

        public Guid UserId { set; get; }

        public SaveDocumentsToNoteCommand(Guid userId, List<FilesBytes> fileBytes)
        {
            FileBytes = fileBytes;
            UserId = userId;
        }
    }

}
