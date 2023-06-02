using System;

namespace Common.DatabaseModels.DapperEntities.Search;

public class NoteContent
{
    public Guid NoteId { set; get; }

    public string Content { set; get; }
}
