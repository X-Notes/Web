using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Domain.Commands.Files
{
    public class SavePhotosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FilesBytes { set; get; }

        public Guid UserId { set; get; }

        public SavePhotosToNoteCommand(Guid userId, List<FilesBytes> photos)
        {
            this.FilesBytes = photos;
            UserId = userId;
        }

    }
}
