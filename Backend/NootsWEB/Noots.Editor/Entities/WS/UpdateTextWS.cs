using Noots.Editor.Entities.Text;

namespace Noots.Editor.Entities.WS;

public class UpdateTextWS
{
    public TextDiff TextDiff { set; get; }

    public UpdateTextWS(TextDiff textDiff)
    {
        TextDiff = textDiff;
    }
}
