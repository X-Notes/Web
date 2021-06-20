using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.NoteContent.ContentParts
{
    public class NoteTextType : BaseEntity<NoteTextTypeENUM>
    {
        public string Name { set; get; }
        public List<TextNote> TextNotes { set; get; }
    }
}
