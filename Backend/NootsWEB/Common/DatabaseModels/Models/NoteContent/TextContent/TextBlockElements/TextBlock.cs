using System.Collections.Generic;
using System.Linq;

namespace Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements
{
    public class TextBlock
    {
        public string Id { set; get; }

        public string HighlightColor { set; get; }

        public string TextColor { set; get; }

        public string Link { set; get; }

        public List<TextType> TextTypes { set; get; }

        public List<BlockLetter> Letters { get; set; }

        public string GetText()
        {
            return string.Join("", this.Letters.OrderBy(x => x.FractionalIndex).Select(x => x.Symbol));
        }
    }
}
