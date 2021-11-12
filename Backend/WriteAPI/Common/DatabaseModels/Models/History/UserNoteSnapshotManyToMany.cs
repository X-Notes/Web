using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.History
{
    [Table(nameof(UserNoteSnapshotManyToMany), Schema = SchemeConfig.NoteHistory)]
    public class UserNoteSnapshotManyToMany : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteSnapshotId { set; get; }
        public NoteSnapshot NoteSnapshot { set; get; }
    }
}
