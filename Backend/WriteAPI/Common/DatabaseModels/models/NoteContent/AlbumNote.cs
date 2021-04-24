using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.NoteContent
{
    [Table("AlbumNote")]
    public class AlbumNote : BaseNoteContent
    {
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public List<AppFile> Photos { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<AlbumNoteAppFile> AlbumNoteAppFiles { set; get; }

        public AlbumNote()
        {

        }

        public AlbumNote(AlbumNote entity, List<AppFile> photos, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;
            this.UpdatedAt = DateTimeOffset.Now;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;

            Photos = photos;
        }
    }
}
