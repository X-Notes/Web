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
        public List<AppFile> Photos { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }
    }
}
