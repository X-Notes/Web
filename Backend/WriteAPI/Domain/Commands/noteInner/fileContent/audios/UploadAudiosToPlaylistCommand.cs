using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.noteInner.fileContent.audios
{
    public class UploadAudiosToPlaylistCommand : BaseCommandEntity, IRequest<OperationResult<List<AudioNoteDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Audios { set; get; }

        public UploadAudiosToPlaylistCommand(Guid NoteId, Guid ContentId, List<IFormFile> Audios)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Audios = Audios;
        }
    }
}
