using System;
using System.ComponentModel.DataAnnotations;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Notes;
using Common.Interfaces;

namespace Common.DatabaseModels.Models.NoteContent
{
    public class BaseNoteContent : BaseEntity<Guid>, IDateUpdater
    {
        public Guid? NoteId { set; get; }
        public Note Note { set; get; }

        public Guid? NoteSnapshotId { set; get; }
        public NoteSnapshot NoteSnapshot { set; get; }


        [Range(1, int.MaxValue)]
        public int Order { set; get; }

        public ContentTypeENUM ContentTypeId { set; get; }
        public ContentType ContentType { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        public void SetId(bool isHistory, Guid EntityId)
        {
            if (!isHistory)
            {
                NoteId = EntityId;
            }
            else
            {
                NoteSnapshotId = EntityId;
            }
        }
    }
}
