using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumPhotoDTO
    {
        public Guid Id { set; get; }
        public string PhotoPathSmall { set; get; }
        public string PhotoPathMedium { set; get; }
        public string PhotoPathBig { set; get; }

        public AlbumPhotoDTO(Guid id, string photoPathSmall, string photoPathMedium, string photoPathBig)
        {
            this.Id = id;
            this.PhotoPathSmall = photoPathSmall;
            this.PhotoPathMedium = photoPathMedium;
            this.PhotoPathBig = photoPathBig;
        }
    }
}
