using System;

namespace Common.DatabaseModels.Models.Users
{
    public class Notification : BaseEntity<Guid>
    {
        public Guid? UserFromId { set; get; }
        public User UserFrom { set; get; }
        public Guid UserToId { set; get; }
        public User UserTo { set; get; }
        public bool IsSystemMessage { set; get; }
        public bool IsRead { set; get; }
        public string Message { set; get; }
        public DateTimeOffset Date { set; get; }
    }
}
