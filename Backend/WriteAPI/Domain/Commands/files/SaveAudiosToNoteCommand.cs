using Common.Attributes;
using Common.DatabaseModels.models.Files;
using Common.DTO.files;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.files
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
