using System.Collections.Generic;

namespace Common.DatabaseModels.Models.Notes
{
    public class NoteType : BaseEntity<NoteTypeENUM>
    {
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
    }
}
