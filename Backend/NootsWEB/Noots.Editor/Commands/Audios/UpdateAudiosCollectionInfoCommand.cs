
namespace Noots.Editor.Commands.Audios;

public class UpdateAudiosCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdateAudiosCollectionInfoCommand(Guid noteId, Guid contentId, string name, string connectionId) : base(noteId, contentId, name, connectionId)
    {
    }
}
