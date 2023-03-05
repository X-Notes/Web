using Noots.RGA_CRDT;
using System.Collections.Generic;
using System.Linq;

namespace Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

public class TextBlock
{
    public TreeRGA<string> Tree { set; get; } // Text

    public BlockProperty<string> HC { set; get; } // highlightColor

    public BlockProperty<string> TC { set; get; } // textColor

    public BlockProperty<string> L { set; get; } // link

    public BlockProperty<List<TextType>> TT { set; get; } // textTypes

    public void UpdateHighlightColor(BlockProperty<string> value)
    {
        if (HC == null || value.Id.Seq > HC.Id.Seq || (value.Id.Seq == HC.Id.Seq && value.Id.Agent <= HC.Id.Agent))
        {
            HC = new BlockProperty<string> { Id = new NodeId { Agent = value.Id.Agent, Seq = value.Id.Seq }, Value = value.Value };
        }
    }

    public void UpdateTextColor(BlockProperty<string> value)
    {
        if (TC == null || value.Id.Seq > TC.Id.Seq || (value.Id.Seq == TC.Id.Seq && value.Id.Agent <= TC.Id.Agent))
        {
            TC = new BlockProperty<string> { Id = new NodeId { Agent = value.Id.Agent, Seq = value.Id.Seq }, Value = value.Value };
        }
    }

    public void UpdateLink(BlockProperty<string> value)
    {
        if (L == null || value.Id.Seq > L.Id.Seq || (value.Id.Seq == L.Id.Seq && value.Id.Agent <= L.Id.Agent))
        {
            L = new BlockProperty<string> { Id = new NodeId { Agent = value.Id.Agent, Seq = value.Id.Seq }, Value = value.Value };
        }
    }

    public void UpdateTextTypes(BlockProperty<List<TextType>> value)
    {
        if (TT == null || value.Id.Seq > TT.Id.Seq || (value.Id.Seq == TT.Id.Seq && value.Id.Agent <= TT.Id.Agent))
        {
            TT = new BlockProperty<List<TextType>> { Id = new NodeId { Agent = value.Id.Agent, Seq = value.Id.Seq }, Value = value.Value };
        }
    }

    public void UpdateTree(MergeTransaction<string> trans)
    {
        Tree ??= new TreeRGA<string>();
        Tree.Merge(trans);
    }

    public string GetText()
    {
        if (Tree == null) return string.Empty;

        return Tree.ReadStr();
    }
}
