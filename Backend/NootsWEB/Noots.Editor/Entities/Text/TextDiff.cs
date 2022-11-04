
using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace Noots.Editor.Entities.Text;

public class TextDiff
{
    public Guid ContentId { set; get; }

    public HTypeENUM? HeadingTypeId { set; get; }

    public NoteTextTypeENUM? NoteTextTypeId { set; get; }

    public bool? Checked { set; get; }

    public List<BlockDiff>? BlockDiffs { set; get; }
}

