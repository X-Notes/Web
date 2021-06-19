using Common.DatabaseModels.models.Notes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DatabaseModels.models.NoteContent
{
    public class BaseNoteContent : BaseEntity<Guid>
    {
        public Guid NoteId { set; get; }
        public Note Note { set; get; }
        [Range(1, int.MaxValue)]
        public int Order { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
    }
}
