﻿using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Storage.Commands
{
    public class SaveUserPhotoCommand : IRequest<AppFile>
    {
        public FilesBytes File { set; get; }

        public Guid UserId { set; get; }

        public SaveUserPhotoCommand(Guid userId, FilesBytes fileBytes)
        {
            File = fileBytes;
            UserId = userId;
        }
    }
}
