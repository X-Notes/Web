using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UploadAudiosToCollectionCommand : BaseCommandEntity, IRequest<OperationResult<List<AudioNoteDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Audios { set; get; }

        public UploadAudiosToCollectionCommand(Guid noteId, Guid contentId, List<IFormFile> audios)
        {
            this.NoteId = noteId;
            this.ContentId = contentId;
            this.Audios = audios;
        }
    }
}
