using System.Text.Json.Serialization;

namespace Noots.RGA_CRDT;

public class MergeTransaction<T>
{
    public List<MergeOp<T>> Ops { set; get; } = new List<MergeOp<T>>();

    [JsonIgnore]
    public List<MergeOp<T>> ValidOps { set; get; } = new List<MergeOp<T>>();

    [JsonIgnore]
    public List<MergeOp<T>> UnValidOps { set; get; } = new List<MergeOp<T>>();

    public void AddInsertOp(T content, NodeId new_node_id, NodeId insert_after_node_id)
    {
        var mergeOp = new MergeOp<T>
        {
            Type = MergeOpType.Insert,
            Content = content,
            NewNodeId = new_node_id,
            InsertAfterNodeId = insert_after_node_id
        };
        Ops.Add(mergeOp);
    }

    public void AddRemoveOp(NodeId delete_nodeId)
    {
        var mergeOp = new MergeOp<T>
        {
            Type = MergeOpType.Delete,
            DeleteNodeId = delete_nodeId
        };
        Ops.Add(mergeOp);
    }
}