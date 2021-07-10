using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Domain.Commands.Files
{
    public class SavePhotosToNoteResponse {
        public AppFile AppFile { set; get; }
        public FilesBytes FilesBytes { set; get; }

        public SavePhotosToNoteResponse(AppFile AppFile, FilesBytes FilesBytes)
        {
            this.AppFile = AppFile;
            this.FilesBytes = FilesBytes;
        }
    }


    public class SavePhotosToNoteCommand : IRequest<List<SavePhotosToNoteResponse>>
    {

        public List<FilesBytes> FilesBytes { set; get; }

        public Guid NoteId { set; get; }

        public Guid UserId { set; get; }


        public SavePhotosToNoteCommand(Guid userId, List<FilesBytes> Photos, Guid NoteId)
        {
            this.FilesBytes = Photos;
            this.NoteId = NoteId;
            UserId = userId;
        }

    }
}
