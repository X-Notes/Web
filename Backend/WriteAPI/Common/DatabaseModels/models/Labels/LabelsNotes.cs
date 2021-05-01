using Common.DatabaseModels.models.Notes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Common.DatabaseModels.models.Labels
{
    public class LabelsNotes : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid LabelId { get; set; }
        public Label Label { get; set; }
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
        public DateTimeOffset AddedAt { set; get; }
    }
}
