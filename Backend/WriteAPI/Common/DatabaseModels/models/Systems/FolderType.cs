using Common.DatabaseModels.models.Folders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Systems
{
    public class FolderType : BaseEntity<Guid>
    {
        public string Name { set; get; }
        public List<Folder> Folders { set; get; }
    }
}
