using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace WriteContext.models
{
    public class Note
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public int Order { set; get; }
        public NoteEditStatus NoteEditStatus { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
