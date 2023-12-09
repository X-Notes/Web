using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Newtonsoft.Json;

namespace Common.DTO.Notes.FullNoteContent.Text;

public class TextBlockDto
{
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