using Common.DatabaseModels.Models.Folders;

namespace Common.DTO.Folders;

public class FoldersCount
{
    public FolderTypeENUM FolderTypeId { set; get; }
    
    public int Count { set; get; }
}