using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Audios
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
