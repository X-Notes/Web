

namespace Editor.Entities;

public class UpdateCollectionContentResult : UpdateBaseContentResult
{
    public List<Guid> FileIds { set; get; }

    public UpdateCollectionContentResult(Guid contentId, int version, DateTimeOffset updatedDate, List<Guid> fileIds) : base(contentId, version, updatedDate)
    {
        FileIds = fileIds;
    }
}
