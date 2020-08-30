using Common.DatabaseModels.helpers;
using Common.DTO.labels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.notes
{
    public class FullNote
    {
        public string Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public List<LabelNote> Labels { set; get; }
        public NotesType NoteType { set; get; }
    }
}
