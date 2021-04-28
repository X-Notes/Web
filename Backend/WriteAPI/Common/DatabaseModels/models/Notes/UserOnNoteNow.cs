using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models.Notes
{
    public class UserOnNoteNow
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
