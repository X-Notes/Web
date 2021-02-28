using System;
using System.Collections.Generic;


namespace Common.DatabaseModels.models
{
    public class NoteType
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
    }
}
