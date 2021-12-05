using System;


namespace Common.DTO.Notes.FullNoteContent
{
    public class DocumentNoteDTO
    {
        public Guid FileId { set; get; }

        public string Name { set; get; }

        public string DocumentPath { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset UploadAt { set; get; }

        public DocumentNoteDTO(string name, string documentPath, Guid fileId, Guid userId, DateTimeOffset uploadAt)
        {
            FileId = fileId;
            Name = name;
            DocumentPath = documentPath;
            AuthorId = userId;
            UploadAt = uploadAt;
        }
    }
}
