using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace WriteContext.models
{
    public class Note
    {
        public Guid Id { get; set; }

        public NoteStatus AccessStatus { set; get; }

        public string Title { set; get; }
        public int Order { set; get; }

        public int UserId { set; get; }
        public User User { set; get; }

        public bool IsDeleted { set; get; }
        public bool IsArchive { set; get; }

        public List<UserOnNote> UserOnNotes { set; get; }
    }
}
