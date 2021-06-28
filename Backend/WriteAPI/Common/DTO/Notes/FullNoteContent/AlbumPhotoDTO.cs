using System;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AlbumPhotoDTO
    {
        public Guid FileId { set; get; }

        public string PhotoPathSmall { set; get; }

        public string PhotoPathMedium { set; get; }

        public string PhotoPathBig { set; get; }

        public string Name { set; get; }

        public AlbumPhotoDTO(Guid fileId, string name, string photoPathSmall, string photoPathMedium, string photoPathBig)
        {
            this.Name = name;
            this.FileId = fileId;
            this.PhotoPathSmall = photoPathSmall;
            this.PhotoPathMedium = photoPathMedium;
            this.PhotoPathBig = photoPathBig;
        }
    }
}
