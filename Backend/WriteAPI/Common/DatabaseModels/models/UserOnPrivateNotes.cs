using System;

namespace Common.DatabaseModels.models
{
    public class UserOnPrivateNotes
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }
        public RefType AccessType { set; get; }
    }
}
