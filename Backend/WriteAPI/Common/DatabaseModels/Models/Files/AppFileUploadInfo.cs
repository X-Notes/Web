using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFileUploadInfo), Schema = SchemeConfig.File)]
    public class AppFileUploadInfo : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { set; get; }
        public AppFile AppFile { set; get; }

        public AppFileUploadStatusEnum StatusId { set; get; }
        public AppFileUploadStatus Status { set; get; }

        public DateTimeOffset? LinkedDate { set; get; }
    }
}
