using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(FileType), Schema = SchemeConfig.File)]
    public class FileType : BaseEntity<FileTypeEnum>
    {
        public string Name { set; get; }
        public List<AppFile> AppFiles { set; get; }
    }
}
