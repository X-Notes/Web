using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent.TextContent
{
    [Table(nameof(HType), Schema = SchemeConfig.NoteContent)]
    public class HType : BaseEntity<HTypeENUM>
    {
        public string Name { set; get; }
        public List<TextNote> TextNotes { set; get; }
    }
}
