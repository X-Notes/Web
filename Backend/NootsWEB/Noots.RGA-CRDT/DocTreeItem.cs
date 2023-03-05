namespace Noots.RGA_CRDT;

public class DocTreeItem<T>
{
    public T Content { get; set; }

    public NodeId Id { get; set; }

    public bool Deleted { get; set; }

    public List<DocTreeItem<T>> Children { get; set; } // always must be sorted seq => agent

    public bool? IsRoot { get; set; }

    public DocTreeItem(T content, NodeId id)
    {
        Content = content;
        Id = new NodeId { Agent = id.Agent, Seq = id.Seq };
        Deleted = false;
        Children = new List<DocTreeItem<T>>();
    }

    public bool IsEqualId(NodeId id)
    {
        return id.Agent == Id.Agent && id.Seq == Id.Seq;
    }

    public DocTreeItem<T> GetNew()
    {
        return new DocTreeItem<T>(Content, Id);
    }

    public DocTreeItem<T> Clone()
    {
        var item = new DocTreeItem<T>(Content, Id);
        item.Deleted = Deleted;
        item.IsRoot = IsRoot;
        item.Children = Children.Select(x => x.Clone()).ToList();
        return item;
    }

    public void InsertNode(DocTreeItem<T> node)
    {
        throw new Exception("Not Implemented");
    }

    public void InsertSimple(DocTreeItem<T> node)
    {
        Children.Add(node);
        Children.Sort(SortF);
    }

    private int SortF(DocTreeItem<T> node1, DocTreeItem<T> node2)
    {
        if (node1.Id.Seq > node2.Id.Seq)
        {
            return -1;
        }
        else if (node1.Id.Seq < node2.Id.Seq)
        {
            return 1;
        }
        if (node1.Id.Agent > node2.Id.Agent)
        {
            return 1;
        }
        else if (node1.Id.Agent < node2.Id.Agent)
        {
            return -1;
        }
        else
        {
            return 0;
        }
    }
}
