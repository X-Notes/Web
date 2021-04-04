using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models
{
    public class ReletatedNoteToInnerNote : BaseEntity
    {
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
        public Guid RelatedNoteId { get; set; }
        public Note RelatedNote { get; set; }
        public bool IsOpened { set; get; }

        // ORDERINGS

        public Guid? NextId { get; set; }
        public Guid? PrevId { get; set; }
    }
}
