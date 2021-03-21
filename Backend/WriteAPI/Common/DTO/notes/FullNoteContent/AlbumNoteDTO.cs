using System;
using System.Collections.Generic;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumNoteDTO : BaseContentNoteDTO
    {
        public List<AlbumPhotoDTO> Photos { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }
        public AlbumNoteDTO(List<AlbumPhotoDTO> Files, string Width, string Height, Guid Id, string Type,
                            Guid? NextId, Guid? PrevId, int CountInRow)
            : base(Id, Type, NextId, PrevId)
        {
            this.Photos = Files;
            this.Height = Height;
            this.Width = Width;
            this.CountInRow = CountInRow;
        }
    }
}
