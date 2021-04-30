using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.History
{
    public class NoteHistory : BaseEntity
    {
        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        public Guid NoteVersionId { set; get; }

        public DateTimeOffset SnapshotTime { set; get; }

        public List<User> Users { set; get; }
        public List<UserNoteHistoryManyToMany> UserHistories { set; get; }

    }
}
