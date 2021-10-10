using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class RemoveAudioFromCollectionCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid AudioId { set; get; }

        public RemoveAudioFromCollectionCommand(Guid noteId, Guid contentId, Guid audioId)
        {
            NoteId = noteId;
            ContentId = contentId;
            AudioId = audioId;
        }
    }
}
