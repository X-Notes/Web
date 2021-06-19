using Common.DatabaseModels.models.Files;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Users
{
    public class UserProfilePhoto : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid AppFileId { set; get; }
        public AppFile AppFile { set; get; }
    }
}
