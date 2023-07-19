using Common.DTO.Notes.FullNoteContent;

namespace Noots.Editor.Commands.Videos;

public class TransformToVideosCollectionCommand : BaseTransformToCommand<VideosCollectionNoteDTO>
{
    public TransformToVideosCollectionCommand(Guid noteId, Guid contentId, string connectionId) : base(noteId, contentId, connectionId)
    {
    }
}
