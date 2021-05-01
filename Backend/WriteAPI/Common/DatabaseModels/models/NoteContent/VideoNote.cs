using Common.DatabaseModels.models.Files;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.NoteContent
{
    [Table("VideoNote")]
    public class VideoNote : BaseNoteContent
    {
        public string Name { set; get; }
        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public VideoNote()
        {

        }

        public VideoNote(VideoNote entity, AppFile video, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;
            this.UpdatedAt = DateTimeOffset.Now;

            Name = entity.Name;

            AppFile = video;
        }
    }
}
