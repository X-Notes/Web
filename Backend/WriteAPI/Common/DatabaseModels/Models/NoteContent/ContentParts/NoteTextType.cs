using System.Collections.Generic;

namespace Common.DatabaseModels.Models.NoteContent.ContentParts
{
    public class NoteTextType : BaseEntity<NoteTextTypeENUM>
    {
        public string Name { set; get; }
        public List<TextNote> TextNotes { set; get; }
    }
}
