using System;

namespace Common.DTO.Notes.FullNoteContent.Files
{
    public class PhotoNoteDTO : BaseFileNoteDTO
    {
        public string PhotoPathSmall { set; get; }

        public string PhotoPathMedium { set; get; }

        public string PhotoPathBig { set; get; }

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
