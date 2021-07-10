using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table("AlbumNote")]
    public class AlbumNote : BaseNoteContent
    {
        public string Name { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public List<AppFile> Photos { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<AlbumNoteAppFile> AlbumNoteAppFiles { set; get; }

        public AlbumNote()
        {
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Album;
        }

        public AlbumNote(AlbumNote entity, List<AlbumNoteAppFile> albumNoteAppFiles, Guid NoteId)
        {
            this.NoteId = NoteId;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Album;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;
            Name = entity.Name;
            Order = entity.Order;

            AlbumNoteAppFiles = albumNoteAppFiles;
        }
    }
}
