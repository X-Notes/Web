using System;
using System.Collections.Generic;
using System.Text;

namespace WriteContext.models
{
    public class UserOnNote
    {
        public int Id { set; get; }

        public int UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
    }
}
