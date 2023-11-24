namespace SignalrUpdater.Entities;

public enum CursorTypeWS
{
    Text = 1,
    Collection,
    Title,
    CollectionTitle,
    None
}

public class UpdateCursorWS
{
    public Guid EntityId { get; set; }

    public CursorTypeWS Type { get; set; }

    public int? StartCursor { get; set; }

    public int? EndCursor { get; set; }

    public string Color { get; set; }

    public Guid? ItemId { get; set; }

    public Guid NoteId { set; get; }

    public Guid UserId { set; get; }

    public UpdateCursorWS(Guid entityId, CursorTypeWS type, int? startCursor, int? endCursor, string color, Guid? itemId, Guid noteId, Guid userId)
    {
        EntityId = entityId;
        Type = type;
        StartCursor = startCursor;
        EndCursor = endCursor;
        Color = color;
        ItemId = itemId;
        NoteId = noteId;
        UserId = userId;
    }
}
