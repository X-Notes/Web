using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.Models.Notes
{
    [Table(nameof(NoteLockState), Schema = SchemeConfig.Note)]
    public class NoteLockState : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        public DateTimeOffset UnlockTime { set; get; }
    }
}
