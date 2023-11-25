using System;

namespace Common.DTO.Notes.Copy;

public class CopyNoteResult
{
    public Guid PreviousId { set; get; }

    public Guid NewId { set; get; }

    public Guid UserId { set; get; }

    public Guid? FolderId { set; get; }
}
