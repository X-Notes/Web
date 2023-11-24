using Common.DTO.Notes.FullNoteContent;

namespace Editor.Commands.Videos;

public class TransformToVideosCollectionCommand : BaseTransformToCommand<VideosCollectionNoteDTO>
{
    public TransformToVideosCollectionCommand(Guid noteId, Guid contentId, string connectionId) : base(noteId, contentId, connectionId)
    {
    }
}
