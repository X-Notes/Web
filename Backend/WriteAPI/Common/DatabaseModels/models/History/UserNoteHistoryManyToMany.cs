using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.History
{
    public class UserNoteHistoryManyToMany : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public Guid NoteHistoryId { set; get; }
        public NoteHistory NoteHistory { set; get; }
    }
}
