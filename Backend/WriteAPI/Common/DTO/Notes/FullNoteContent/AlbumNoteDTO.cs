using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AlbumNoteDTO : BaseContentNoteDTO
    {
        public List<AlbumPhotoDTO> Photos { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }
        public AlbumNoteDTO(List<AlbumPhotoDTO> Files, string Width, 
            string Height, Guid Id, int CountInRow, DateTimeOffset UpdatedAt)
            : base(Id, ContentTypeENUM.Album, UpdatedAt)
        {
            this.Photos = Files;
            this.Height = Height;
            this.Width = Width;
            this.CountInRow = CountInRow;
        }
    }
}
