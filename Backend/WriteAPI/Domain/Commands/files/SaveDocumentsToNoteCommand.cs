using Common.DatabaseModels.models.Files;
using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Commands.files
{

    public class SaveDocumentsToNoteCommand : IRequest<AppFile>
    {
        public FilesBytes FileBytes { set; get; }

        public Guid NoteId { set; get; }

        public Guid UserId { set; get; }

        public SaveDocumentsToNoteCommand(Guid userId, FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            UserId = userId;
        }
    }

}
