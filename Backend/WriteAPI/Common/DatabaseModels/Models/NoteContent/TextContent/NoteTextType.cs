using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent.TextContent
{
    [Table(nameof(NoteTextType), Schema = SchemeConfig.NoteContent)]
    public class NoteTextType : BaseEntity<NoteTextTypeENUM>
    {
        public string Name { set; get; }
        public List<TextNote> TextNotes { set; get; }
    }
}
