using System;

namespace Common.DTO.History;

public class NoteHistoryChange
{
    public Guid NoteId { set; get; }
    
    public Guid UserId { set; get; }
}
