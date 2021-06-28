using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table("VideoNote")]
    public class VideoNote : BaseNoteContent
    {
        public string Name { set; get; }
        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public VideoNote()
        {
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Video;
        }

        public VideoNote(VideoNote entity, AppFile video, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Video;

            Name = entity.Name;

            AppFile = video;
        }
    }
}
