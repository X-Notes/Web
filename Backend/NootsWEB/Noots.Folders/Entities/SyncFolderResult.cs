namespace Folders.Entities;

public class SyncFolderResult
{
    public Guid FolderId { set; get; }

    public string Color { set; get; }

    public string Title { set; get; }

    public int Version { set; get; }

    public List<Guid>? NoteIdsToDelete { set; get; }

    public List<Guid>? NoteIdsToAdd { set; get; }
}
