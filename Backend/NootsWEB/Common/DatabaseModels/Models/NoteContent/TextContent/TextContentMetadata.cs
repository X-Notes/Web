using Newtonsoft.Json;

namespace Common.DatabaseModels.Models.NoteContent.TextContent;

public class TextContentMetadata
{
    [JsonProperty("t")]
    public NoteTextTypeENUM NoteTextTypeId { set; get; } // note type text id
    
    [JsonProperty("h")]
    public HTypeENUM? HTypeId { set; get; } // h type id
    
    [JsonProperty("c")]
    public bool? Checked { set; get; } // checked
    
    [JsonProperty("tb")]
    public int? TabCount { set; get; } // tab count
}