using Common.DatabaseModels.models.Notes;
using System;
using System.Collections.Generic;


namespace Common.DatabaseModels.models.Systems
{
    public class NoteType : BaseEntity<Guid>
    {
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
    }
}
