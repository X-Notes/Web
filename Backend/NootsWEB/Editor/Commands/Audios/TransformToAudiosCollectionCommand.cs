using Common.DTO.Notes.FullNoteContent;

namespace Editor.Commands.Audios;

public class TransformToAudiosCollectionCommand : BaseTransformToCommand<AudiosCollectionNoteDTO>
{
    public TransformToAudiosCollectionCommand(Guid noteId, Guid contentId, string connectionId)
        : base(noteId, contentId, connectionId)
    {
    }
}
