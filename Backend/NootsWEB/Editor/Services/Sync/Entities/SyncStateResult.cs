using Common.DTO.Notes.FullNoteContent;

namespace Editor.Services.Sync.Entities;

public class SyncStateResult
{
    public List<Guid> IdsToDelete { set; get; }

    public List<BaseNoteContentDTO> ContentsToAdd { set; get; }

    public List<BaseNoteContentDTO> ContentsToUpdate { set; get; }
}
