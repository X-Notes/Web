using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(CollectionNoteAppFile), Schema = SchemeConfig.NoteContent)]
    public class CollectionNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid CollectionNoteId { get; set; }
        public CollectionNote CollectionNote { get; set; }
    }
}
