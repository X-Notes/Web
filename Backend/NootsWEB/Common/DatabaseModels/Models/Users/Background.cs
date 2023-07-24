using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.Users
{
    [Table(nameof(Background), Schema = SchemeConfig.User)]
    public class Background : BaseEntity<Guid>
    {
        public Guid FileId { set; get; }
        public AppFile File { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public User CurrentUserBackground { set; get; }
    }
}
