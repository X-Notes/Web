using System;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.Users
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
