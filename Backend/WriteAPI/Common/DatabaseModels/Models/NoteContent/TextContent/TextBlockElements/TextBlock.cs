using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements
{
    public class TextBlock
    {
        public string Text { get; set; }

        public string HighlightColor { set; get; }

        public string TextColor { set; get; }

        public List<TextType> TextTypes { set; get; }      
    }
}
