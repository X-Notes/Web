using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace Common.DTO.Notes.FullNoteContent.Text;

public class TextContentMetadataDto
{
    public TextContentMetadataDto(NoteTextTypeENUM noteTextTypeId, HTypeENUM? hTypeId, bool? @checked, int? tabCount)
    {
        NoteTextTypeId = noteTextTypeId;
        HTypeId = hTypeId;
        Checked = @checked;
        TabCount = tabCount;
    }

    public NoteTextTypeENUM NoteTextTypeId { set; get; }
    
    public HTypeENUM? HTypeId { set; get; }
    
    public bool? Checked { set; get; }
    
    public int? TabCount { set; get; }
}