using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;

namespace Domain.Commands.noteInner.fileContent.audios
{
    public class RemovePlaylistCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public RemovePlaylistCommand(Guid NoteId, Guid ContentId, string Email)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Email = Email;
        }
    }
}
