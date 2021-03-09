using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models
{
    public class AppFile : BaseEntity
    {
        public string Path { set; get; }
        public string Type { set; get; }
        public User User { get; set; }
        public List<AlbumNote> AlbumNotes { set; get; }
    }
}
