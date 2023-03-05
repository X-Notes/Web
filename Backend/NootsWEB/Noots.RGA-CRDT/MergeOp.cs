namespace Noots.RGA_CRDT;

public enum MergeOpType
{
    Insert,
    Delete
}

public class MergeOp<T>
{
    public MergeOpType Type { get; set; }

    public NodeId DeleteNodeId { get; set; }

    public NodeId InsertAfterNodeId { get; set; }

    public T Content { get; set; }

    public NodeId NewNodeId { get; set; }
}