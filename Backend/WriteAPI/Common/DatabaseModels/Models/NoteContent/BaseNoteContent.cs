using System;
using System.ComponentModel.DataAnnotations;
using Common.DatabaseModels.Models.Notes;

namespace Common.DatabaseModels.Models.NoteContent
{
    public class BaseNoteContent : BaseEntity<Guid>
    {
        public Guid NoteId { set; get; }

        public Note Note { set; get; }

        [Range(1, int.MaxValue)]
        public int Order { set; get; }

        public ContentTypeENUM ContentTypeId { set; get; }
        public ContentType ContentType { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }
    }
}
