using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Common.DatabaseModels.models.Notes
{
    public class UserOnNoteNow : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
