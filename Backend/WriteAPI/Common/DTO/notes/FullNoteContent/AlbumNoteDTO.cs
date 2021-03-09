using System;
using System.Collections.Generic;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumNoteDTO : BaseContentNoteDTO
    {
        public List<AlbumPhotoDTO> Photos { set; get; }
        public AlbumNoteDTO(List<AlbumPhotoDTO> Files, Guid Id, string Type,
                            Guid? NextId, Guid? PrevId)
            : base(Id, Type, NextId, PrevId)
        {
            this.Photos = Files;
        }
    }
}
