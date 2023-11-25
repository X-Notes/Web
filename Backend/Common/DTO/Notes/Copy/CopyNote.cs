using System;

namespace Common.DTO.Notes.Copy;

public class CopyNote
{
    public Guid NoteId { set; get; }

    public Guid UserId { set; get; }

    public Guid? FolderId { set; get; }
}
