using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.Users
{
    public class UserProfilePhoto : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid AppFileId { set; get; }
        public AppFile AppFile { set; get; }
    }
}
