using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class PhotosCollectionNoteDTO : BaseNoteContentDTO
    {
        public List<PhotoNoteDTO> Photos { set; get; }

        public string Name { set; get; }

        public string Width { set; get; }

        public string Height { set; get; }

        public int CountInRow { set; get; }

        public PhotosCollectionNoteDTO(List<PhotoNoteDTO> files, string name, string width, string height, Guid id, int order, int countInRow, DateTimeOffset updatedAt)
            : base(id, order, ContentTypeENUM.PhotosCollection, updatedAt)
        {
            this.Photos = files;
            this.Name = name;
            this.Height = height;
            this.Width = width;
            this.CountInRow = countInRow;
        }
    }
}
