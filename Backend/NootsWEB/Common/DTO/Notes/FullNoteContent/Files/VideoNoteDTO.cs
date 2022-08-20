using System;

namespace Common.DTO.Notes.FullNoteContent.Files
{
    public class VideoNoteDTO : BaseFileNoteDTO
    {
        public string VideoPath { set; get; }

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
