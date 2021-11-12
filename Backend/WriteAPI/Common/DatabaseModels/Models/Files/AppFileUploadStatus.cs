using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFileUploadStatus), Schema = SchemeConfig.File)]
    public class AppFileUploadStatus : BaseEntity<AppFileUploadStatusEnum>
    {
        public string Name { set; get; }
        public List<AppFileUploadInfo> AppFileUploadInfos { set; get; }
    }
}
