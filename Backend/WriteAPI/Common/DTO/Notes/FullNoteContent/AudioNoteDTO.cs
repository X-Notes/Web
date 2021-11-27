using System;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AudioNoteDTO
    {
        public Guid FileId { set; get; }

        public string Name { set; get; }

        public string AudioPath { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset UploadAt { set; get; }

        public AudioNoteDTO(string name, Guid fileId, string audioPath, Guid userId, DateTimeOffset uploadAt)
        {
            FileId = fileId;
            Name = name;
            AudioPath = audioPath;
            AuthorId = userId;
            UploadAt = uploadAt;
        }
    }
}
