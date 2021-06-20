using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
{
    public class VideoNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public Guid FileId { set; get; }
        public string VideoPath { set; get; }
        public VideoNoteDTO(string Name, Guid fileId, string VideoPath, Guid Id, DateTimeOffset UpdatedAt)
        : base(Id, ContentTypeENUM.Video, UpdatedAt)
        {
            this.FileId = fileId;
            this.Name = Name;
            this.VideoPath = VideoPath;
        }
    }
}
