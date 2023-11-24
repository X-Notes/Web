namespace Editor.Services.Interaction.Entities;

public class Cursor
{
    public Guid EntityId { get; set; }

    public CursorType Type { get; set; }

    public int? StartCursor { get; set; }

    public int? EndCursor { get; set; }

    public string Color { get; set; }

    public Guid? ItemId { get; set; }
}