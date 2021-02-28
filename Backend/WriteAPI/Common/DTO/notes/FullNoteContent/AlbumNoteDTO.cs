using System;
using System.Collections.Generic;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumNoteDTO : BaseContentNoteDTO
    {
        public List<AlbumPhotoDTO> Files { set; get; }
        public AlbumNoteDTO(List<AlbumPhotoDTO> Files, Guid Id, int Order, string Type)
            : base(Id, Order, Type)
        {
            this.Files = Files;
        }
    }
}
