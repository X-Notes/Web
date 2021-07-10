using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class InsertAudiosToNoteCommand : BaseCommandEntity, IRequest<OperationResult<AudiosPlaylistNoteDTO>>
    {
        [Required]
        public List<IFormFile> Audios { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public InsertAudiosToNoteCommand(List<IFormFile> Audios, Guid NoteId, Guid ContentId)
        {
            this.Audios = Audios;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
