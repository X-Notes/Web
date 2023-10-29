using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

namespace Common.DTO.Notes.FullNoteContent.Text;

public class TextBlockDto
{
    public string Text { get; set; }
    
    public string HighlightColor { set; get; }
    
    public string TextColor { set; get; }
    
    public string Link { set; get; }
    
    public List<TextType> TextTypes { set; get; }      
}