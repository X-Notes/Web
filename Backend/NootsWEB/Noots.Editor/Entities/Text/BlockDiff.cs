using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

namespace Noots.Editor.Entities.Text;

public class BlockDiff
{
    public string Id { set; get; }

    public string? HighlightColor { set; get; }

    public string? TextColor { set; get; }

    public string? Link { set; get; }

    public List<TextType>? TextTypes { set; get; }

    public List<string>? LetterIdsToDelete { set; get; }

    public List<BlockLetter>? LettersToAdd { set; get; }
}
