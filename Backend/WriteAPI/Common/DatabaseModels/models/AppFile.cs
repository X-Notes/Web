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
        public User User { get; set; } // TODO ADD USER
        public List<AlbumNote> AlbumNotes { set; get; }
        public List<AlbumNoteAppFile> AlbumNoteAppFiles { set; get; }
        public List<VideoNote> VideoNotes { set; get; }
        public List<AudioNote> AudioNotes { set; get; }
        public List<DocumentNote> DocumentNotes { set; get; }
    }
}
