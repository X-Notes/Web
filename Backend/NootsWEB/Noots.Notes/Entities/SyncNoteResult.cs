using Common.DTO.Labels;

namespace Notes.Entities;

public class SyncNoteResult
{
    public Guid NoteId { set; get; }

    public string Color { set; get; }

    public string Title { set; get; }

    public List<LabelDTO> Labels { set; get; }

    public int Version { set; get; }
}
