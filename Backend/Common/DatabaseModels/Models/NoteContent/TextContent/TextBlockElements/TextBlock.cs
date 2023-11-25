using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements
{
    public class TextBlock
    {
        public TextBlock()
        {
                
        }
        
        public TextBlock(string text, string highlightColor, string textColor, string link, List<TextType> textTypes)
        {
            Text = text;
            HighlightColor = highlightColor;
            TextColor = textColor;
            Link = link;
            TextTypes = textTypes;
        }

        [JsonProperty("t")]
        public string Text { get; set; }

        [JsonProperty("hc")]
        public string HighlightColor { set; get; }

        [JsonProperty("tc")]
        public string TextColor { set; get; }
        
        [JsonProperty("l")]
        public string Link { set; get; }

        [JsonProperty("tt")]
        public List<TextType> TextTypes { set; get; }      
    }
}
