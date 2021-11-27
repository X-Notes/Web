﻿using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Files;
using MediatR;

namespace Domain.Commands.Files
{
    public class SaveVideosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<FilesBytes> FileBytes { set; get; }

        public Guid NoteId { set; get; }

        public Guid UserId { set; get; }

        public SaveVideosToNoteCommand(Guid userId, List<FilesBytes> fileBytes, Guid noteId)
        {
            this.FileBytes = fileBytes;
            this.NoteId = noteId;
            UserId = userId;
        }
    }
}