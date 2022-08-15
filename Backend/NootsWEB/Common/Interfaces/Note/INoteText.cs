using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using System.Collections.Generic;

namespace Common.Interfaces.Note
{
    public interface INoteText
    {
        public List<TextBlock> Contents { set; get; }

        NoteTextTypeENUM NoteTextTypeId { set; get; }

        HTypeENUM? HTypeId { set; get; }

        public bool? Checked { set; get; }
    }
}
