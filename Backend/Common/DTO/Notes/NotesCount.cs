using Common.DatabaseModels.Models.Notes;

namespace Common.DTO.Notes;

public class NotesCount
{
    public NoteTypeENUM NoteTypeId { set; get; }
    
    public int Count { set; get; }
}