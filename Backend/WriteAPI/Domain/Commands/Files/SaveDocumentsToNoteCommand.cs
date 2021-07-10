using System;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Domain.Commands.Files
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
