using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Notes;
using Common.Interfaces.Note;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table(nameof(BaseNoteContent), Schema = SchemeConfig.NoteContent)]
    public class BaseNoteContent : BaseEntity<Guid>, IBaseNoteContent
    {
        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        [Range(0, int.MaxValue)]
        public int Order { set; get; }

        public ContentTypeENUM ContentTypeId { set; get; }
        public ContentType ContentType { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        [NotMapped]
        public Guid PrevId { set; get; }

        public virtual IEnumerable<Guid> GetInternalFilesIds()
        {
            return new List<Guid>();
        }
    }
}
