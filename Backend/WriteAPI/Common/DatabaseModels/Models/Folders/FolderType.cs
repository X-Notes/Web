using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Folders
{
    [Table(nameof(FolderType), Schema = SchemeConfig.Folder)]
    public class FolderType : BaseEntity<FolderTypeENUM>
    {
        public string Name { set; get; }
        public List<Folder> Folders { set; get; }
    }
}
