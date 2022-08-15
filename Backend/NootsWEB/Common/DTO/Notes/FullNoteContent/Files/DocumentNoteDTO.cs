using System;


namespace Common.DTO.Notes.FullNoteContent.Files
{
    public class DocumentNoteDTO : BaseFileNoteDTO
    {
        public string DocumentPath { set; get; }

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
