using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class LabelsNotes
    {
        public int LabelId { get; set; }
        public Label Label { get; set; }
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
    }
}
