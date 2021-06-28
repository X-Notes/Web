using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Notes
{
    public class UserOnNoteNow : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
