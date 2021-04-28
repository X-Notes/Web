using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;

namespace Common.DatabaseModels.models.Notes
{
    public class UserOnPrivateNotes
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        public Guid AccessTypeId { set; get; }
        public RefType AccessType { set; get; }
    }
}
