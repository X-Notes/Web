using Common.Interfaces;
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
        public DateTimeOffset? UnLinkedDate { set; get; }

        public AppFileUploadInfo()
        {
        }

        public AppFileUploadInfo SetLinked()
        {
            StatusId = AppFileUploadStatusEnum.Linked;
            LinkedDate = DateTimeProvider.Time;
            UnLinkedDate = null;
            return this;
        }

        public AppFileUploadInfo SetUnLinked()
        {
            StatusId = AppFileUploadStatusEnum.UnLinked;
            LinkedDate = null;
            UnLinkedDate = DateTimeProvider.Time;
            return this;
        }
    }
}
