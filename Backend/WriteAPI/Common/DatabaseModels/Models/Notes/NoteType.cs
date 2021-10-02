using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Notes
{
    [Table(nameof(NoteType), Schema = SchemeConfig.Note)]
    public class NoteType : BaseEntity<NoteTypeENUM>
    {
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
    }
}
