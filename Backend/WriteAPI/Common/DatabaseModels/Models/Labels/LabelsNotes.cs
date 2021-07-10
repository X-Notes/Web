using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Notes;

namespace Common.DatabaseModels.Models.Labels
{
    public class LabelsNotes : BaseEntity<Guid>
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
