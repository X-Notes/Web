using System.Collections.Generic;

namespace Common.DatabaseModels.Models.Files
{
    public class FileType
    {
        public FileTypeEnum Id { set; get; }
        public string Name { set; get; }
        public List<AppFile> AppFiles { set; get; }
    }
}
