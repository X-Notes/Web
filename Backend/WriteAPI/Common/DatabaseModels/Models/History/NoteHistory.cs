using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.History
{
    public class NoteHistory : BaseEntity<Guid>
    {
        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        public Guid NoteVersionId { set; get; }

        public DateTimeOffset SnapshotTime { set; get; }

        public List<User> Users { set; get; }
        public List<UserNoteHistoryManyToMany> UserHistories { set; get; }

    }
}
