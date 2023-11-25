using System;

namespace Common.DTO.Notes.AdditionalContent;

public class NoteRelatedNoteInfo
{
    public Guid NoteId { set; get; }

    public string Name { set; get; }

    public NoteRelatedNoteInfo(Guid noteId, string name)
    {
        NoteId = noteId;
        Name = name;
    }
}
