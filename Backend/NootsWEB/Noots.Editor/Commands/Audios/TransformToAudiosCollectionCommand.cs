using Common.DTO.Notes.FullNoteContent;

namespace Noots.Editor.Commands.Audios;

public class TransformToAudiosCollectionCommand : BaseTransformToCommand<AudiosCollectionNoteDTO>
{
    public TransformToAudiosCollectionCommand(Guid noteId, Guid contentId)
        : base(noteId, contentId)
    {
    }
}
