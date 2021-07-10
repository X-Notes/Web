using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Domain.Commands.Files
{

    public class SaveAudiosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FileBytes { set; get; }

        public Guid NoteId { set; get; }

        public Guid UserId { set; get; }


        public SaveAudiosToNoteCommand(Guid userId, List<FilesBytes> FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            UserId = userId;
        }

    }
}
