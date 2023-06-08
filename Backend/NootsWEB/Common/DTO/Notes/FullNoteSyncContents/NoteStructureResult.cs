using Common.DTO.WebSockets.InnerNote;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class NoteStructureResult
{
    public List<UpdateIds> UpdateIds { get; set; } = new List<UpdateIds>();

    public UpdateNoteStructureWS Updates { set; get; } = new();

    public NoteStructureResult()
    {

    }
}
