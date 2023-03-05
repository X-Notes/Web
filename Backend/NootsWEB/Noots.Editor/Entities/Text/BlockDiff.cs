using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Noots.RGA_CRDT;

namespace Noots.Editor.Entities.Text;

public class BlockDiff
{
    public TreeRGA<string> Tree { set; get; } // Text

    public BlockProperty<string> HighlightColor { set; get; } // highlightColor

    public BlockProperty<string> TextColor { set; get; } // textColor

    public BlockProperty<string> Link { set; get; } // link

    public BlockProperty<List<TextType>> TextTypes { set; get; } // textTypes

    public MergeTransaction<string> MergeOps { set; get; }
}
