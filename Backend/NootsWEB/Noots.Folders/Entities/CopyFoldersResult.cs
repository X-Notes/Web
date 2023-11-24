using Common.DTO.Folders;

namespace Folders.Entities;

public class CopyFoldersResult
{
    public List<SmallFolder> Folders { set; get; }

    public List<Guid> NoteIds { set; get; }
}
