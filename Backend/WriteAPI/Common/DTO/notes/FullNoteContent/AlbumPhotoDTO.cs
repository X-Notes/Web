using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumPhotoDTO
    {
        public Guid Id { set; get; }
        public AlbumPhotoDTO(Guid Id)
        {
            this.Id = Id;
        }
    }
}
