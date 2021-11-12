using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Notes;

namespace Common.DatabaseModels.Models.Folders
{
    [Table(nameof(FoldersNotes), Schema = SchemeConfig.Folder)]
    public class FoldersNotes : BaseEntity<Guid>
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
