using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files.Contents
{
    [Table(nameof(VideoNoteAppFile), Schema = SchemeConfig.NoteContent)]
    public class VideoNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid VideosCollectionNoteId { get; set; }
        public VideosCollectionNote VideosCollectionNote { get; set; }
    }
}
