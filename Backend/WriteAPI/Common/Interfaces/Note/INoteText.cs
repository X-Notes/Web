using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace Common.Interfaces.Note
{
    public interface INoteText
    {
        string Content { set; get; }

        NoteTextTypeENUM NoteTextTypeId { set; get; }

        HTypeENUM? HTypeId { set; get; }

        bool? Checked { set; get; }

        bool IsBold { set; get; }

        bool IsItalic { set; get; }
    }
}
