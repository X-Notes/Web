using System;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
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
