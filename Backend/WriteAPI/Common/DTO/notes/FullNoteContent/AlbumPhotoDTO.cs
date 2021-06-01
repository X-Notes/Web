using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumPhotoDTO
    {
        public Guid Id { set; get; }
        public string PhotoPath { set; get; }
        public AlbumPhotoDTO(Guid id, string photoPath)
        {
            this.Id = id;
            this.PhotoPath = photoPath;
        }
    }
}
