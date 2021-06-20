using System.Collections.Generic;


namespace Common.DatabaseModels.models.Folders
{
    public class FolderType : BaseEntity<FolderTypeENUM>
    {
        public string Name { set; get; }
        public List<Folder> Folders { set; get; }
    }
}
