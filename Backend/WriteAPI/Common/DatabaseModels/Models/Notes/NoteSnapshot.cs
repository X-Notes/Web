using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.Notes
{
    public class NoteSnapshot : BaseEntity<Guid>, IBaseNote
    {
        public NoteTypeENUM NoteTypeId { set; get; }
        public NoteType NoteType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }

        public List<LabelsNotes> LabelsNotes { get; set; }
        public List<BaseNoteContent> Contents { set; get; }

        public Guid NoteVersionId { set; get; }
        public DateTimeOffset SnapshotTime { set; get; }

        public List<User> Users { set; get; }
        public List<UserNoteHistoryManyToMany> UserHistories { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
