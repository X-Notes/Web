using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class FoldersNotes : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid FolderId { get; set; }
        public Folder Folder { get; set; }
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
        public int Order { set; get; }
    }
}
