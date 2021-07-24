using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.History
{
    public class UserNoteHistoryManyToMany : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteHistoryId { set; get; }
        public NoteSnapshot NoteHistory { set; get; }
    }
}
