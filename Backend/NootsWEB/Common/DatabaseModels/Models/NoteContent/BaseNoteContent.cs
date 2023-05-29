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
        public int _version;

        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        [Range(0, int.MaxValue)]
        public int Order { set; get; }

        [Range(1, int.MaxValue)]
        public int Version
        {
            get
            {
                return this._version;
            }
            set
            {
                if (value <= 0) throw new Exception("Value cannot be 0");
                this._version = value;
            }
        }

        public ContentTypeENUM ContentTypeId { set; get; }
        public ContentType ContentType { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        [NotMapped]
        public Guid PrevId { set; get; }

        public virtual IEnumerable<Guid> GetInternalFilesIds()
        {
            return new List<Guid>();
        }

        public void SetDateAndVersion()
        {
            UpdatedAt = DateTimeProvider.Time;
            Version++;
        }
    }
}
