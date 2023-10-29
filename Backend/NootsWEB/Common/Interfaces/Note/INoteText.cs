using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using System.Collections.Generic;

namespace Common.Interfaces.Note
{
    public interface INoteText
    {
        public string  Contents { set; get; }

        public string PlainContent { set; get; }
        
        public string  Metadata { set; get; }
    }
}
