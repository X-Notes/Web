namespace Noots.RGA_CRDT;

public static class MergeOpHelper
{
    public static MergeTransaction<string> ConvertStrIntoTransaction(this string str)
    {
        var trans = new MergeTransaction<string>();

        var agent_id = 0;
        var seq = 1;

        foreach(var symbol in str)
        {
            var new_node_id = new NodeId { Agent = agent_id, Seq = seq + 1 };
            var insertAfter = new NodeId { Agent = agent_id, Seq = seq };
            trans.AddInsertOp(symbol.ToString(), new_node_id, insertAfter);
            seq++;
        }

        return trans;
    }
}
