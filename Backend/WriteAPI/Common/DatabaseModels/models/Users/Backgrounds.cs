using Common.DatabaseModels.models.Files;
using System;

namespace Common.DatabaseModels.models.Users
{
    public class Backgrounds : BaseEntity<Guid>
    {
        public Guid FileId { set; get; }
        public AppFile File { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public User CurrentUserBackground { set; get; }
    }
}
