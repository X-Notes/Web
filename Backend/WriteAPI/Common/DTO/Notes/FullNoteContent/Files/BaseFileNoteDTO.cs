using System;

namespace Common.DTO.Notes.FullNoteContent.Files
{
    public class BaseFileNoteDTO
    {
        public Guid FileId { set; get; }

        public string Name { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset UploadAt { set; get; }
    }
}
