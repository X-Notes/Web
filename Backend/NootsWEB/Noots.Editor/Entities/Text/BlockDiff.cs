using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Noots.Editor.Entities.Text;

public class BlockDiff
{
    public string? HighlightColor { set; get; }

    public string? TextColor { set; get; }

    public string? Link { set; get; }

    public List<TextType>? TextTypes { set; get; }

    public List<Guid>? LetterIdsToDelete { set; get; }

    public List<LetterDiff>? LettersToAdd { set; get; }
}
