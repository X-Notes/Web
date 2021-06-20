using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.audios
{
    public class InsertAudiosToNoteCommand : BaseCommandEntity, IRequest<OperationResult<AudioNoteDTO>>
    {
        [Required]
        public IFormFile Audio { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public InsertAudiosToNoteCommand(IFormFile Audio, Guid NoteId, Guid ContentId)
        {
            this.Audio = Audio;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
