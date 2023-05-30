using System.ComponentModel.DataAnnotations;

namespace Noots.Editor.Commands.Photos;

public class UpdatePhotosCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdatePhotosCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
    {
    }

    [Range(1, 4)]
    public int Count { set; get; }

    [Required(AllowEmptyStrings = false)]
    public string Width { set; get; }

    [Required(AllowEmptyStrings = false)]
    public string Height { set; get; }
}
