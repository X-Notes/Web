using System;

namespace Common.DTO.Notes.FullNoteContent
{
    public class VideoNoteDTO
    {
        public Guid FileId { set; get; }

        public string Name { set; get; }

        public string VideoPath { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset UploadAt { set; get; }

        public VideoNoteDTO(string name, Guid fileId, string videoPath, Guid userId, DateTimeOffset uploadAt)
        {
            FileId = fileId;
            Name = name;
            VideoPath = videoPath;
            AuthorId = userId;
            UploadAt = uploadAt;
        }
    }
}
