using System;

namespace Common.DTO.Notes.AdditionalContent;

public class NoteFolderInfo
{
    public Guid FolderId { set; get; }
    
    public string FolderName { set; get; }

    public NoteFolderInfo(Guid FolderId, string FolderName)
    {
        this.FolderId = FolderId;
        this.FolderName = FolderName;
    }
}
