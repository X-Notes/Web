using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Files
{
    public class FileType
    {
        public FileTypeEnum Id { set; get; }
        public string Name { set; get; }
        public List<AppFile> AppFiles { set; get; }
    }
}
