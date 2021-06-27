using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;

namespace Domain.Commands.noteInner.fileContent.audios
{
    public class RemoveAudioCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid AudioId { set; get; }

        public RemoveAudioCommand(Guid noteId, Guid contentId, Guid audioId)
        {
            NoteId = noteId;
            ContentId = contentId;
            AudioId = audioId;
        }
    }
}
