using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Storage.Commands
{

    public class SaveAudiosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FileBytes { set; get; }

        public Guid UserId { set; get; }


        public SaveAudiosToNoteCommand(Guid userId, List<FilesBytes> fileBytes)
        {
            FileBytes = fileBytes;
            UserId = userId;
        }

    }
}
