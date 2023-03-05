namespace Noots.RGA_CRDT;

public class BlockProperty<T>
{
    public T Value { get; set; }

    public NodeId Id { set; get; }
}
