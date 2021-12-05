using System;

namespace Common.DTO.Notes.FullNoteContent
{
    public class PhotoNoteDTO
    {
        public Guid FileId { set; get; }

        public string PhotoPathSmall { set; get; }

        public string PhotoPathMedium { set; get; }

        public string PhotoPathBig { set; get; }

        public string Name { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset UploadAt { set; get; }

        public PhotoNoteDTO(Guid fileId, string name, string photoPathSmall, string photoPathMedium, string photoPathBig, Guid userId, DateTimeOffset uploadAt)
        {
            Name = name;
            FileId = fileId;
            PhotoPathSmall = photoPathSmall;
            PhotoPathMedium = photoPathMedium;
            PhotoPathBig = photoPathBig;
            AuthorId = userId;
            UploadAt = uploadAt;
        }
    }
}
