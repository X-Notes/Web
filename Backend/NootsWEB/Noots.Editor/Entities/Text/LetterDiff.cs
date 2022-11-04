

namespace Noots.Editor.Entities.Text;

public class LetterDiff
{
    public DiffOperation Operation { set; get; }

    public string Letter { set; get; }
}

public enum DiffOperation
{
    DELETE = -1,
    SAME = 0,
    ADD = 1,
}