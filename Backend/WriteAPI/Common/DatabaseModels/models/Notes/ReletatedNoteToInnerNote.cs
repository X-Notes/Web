using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Notes
{
    public class ReletatedNoteToInnerNote : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
        public Guid RelatedNoteId { get; set; }
        public Note RelatedNote { get; set; }
        public bool IsOpened { set; get; }
        public int Order { set; get; }
    }
}
