using System;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class VideoNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }

        public Guid FileId { set; get; }

        public string VideoPath { set; get; }

        public Guid AuthorId { set; get; }

        public VideoNoteDTO(string name, Guid fileId, string videoPath, Guid id, DateTimeOffset updatedAt, Guid userId)
        : base(id, ContentTypeENUM.Video, updatedAt)
        {
            FileId = fileId;
            Name = name;
            VideoPath = videoPath;
            AuthorId = userId;
        }
    }
}
