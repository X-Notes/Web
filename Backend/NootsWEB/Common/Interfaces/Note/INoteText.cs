using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace Common.Interfaces.Note;

public interface INoteText<T>
{
    public T Contents { set; get; }

    NoteTextTypeENUM NoteTextTypeId { set; get; }

    HTypeENUM? HTypeId { set; get; }

    public bool? Checked { set; get; }
}
