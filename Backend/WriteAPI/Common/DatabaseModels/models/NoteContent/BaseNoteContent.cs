using System;


namespace Common.DatabaseModels.models.NoteContent
{
    public class BaseNoteContent : BaseEntity
    {
        public Guid? NextId { get; set; }
        public virtual BaseNoteContent Next { get; set; }
        public Guid? PrevId { get; set; }
        public virtual BaseNoteContent Prev { get; set; }
        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
