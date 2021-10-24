using Common.Interfaces;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFileUploadInfo), Schema = SchemeConfig.File)]
    public class AppFileUploadInfo : BaseEntity<Guid>, IDateCreator
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { set; get; }
        public AppFile AppFile { set; get; }

        public AppFileUploadStatusEnum StatusId { set; get; }
        public AppFileUploadStatus Status { set; get; }

        public DateTimeOffset? LinkedDate { set; get; }
        public DateTimeOffset? UnLinkedDate { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public AppFileUploadInfo()
        {
            CreatedAt = DateTimeOffset.UtcNow;
        }

        public AppFileUploadInfo SetLinked()
        {
            StatusId = AppFileUploadStatusEnum.Linked;
            LinkedDate = DateTimeOffset.UtcNow;
            UnLinkedDate = null;
            return this;
        }

        public AppFileUploadInfo SetUnLinked()
        {
            StatusId = AppFileUploadStatusEnum.UnLinked;
            LinkedDate = null;
            UnLinkedDate = DateTimeOffset.UtcNow;
            return this;
        }
    }
}
