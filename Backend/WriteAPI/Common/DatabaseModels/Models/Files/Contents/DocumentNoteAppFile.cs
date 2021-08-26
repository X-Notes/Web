using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files.Contents
{
    [Table(nameof(DocumentNoteAppFile), Schema = SchemeConfig.NoteContent)]
    public class DocumentNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid DocumentsCollectionNoteId { get; set; }
        public DocumentsCollectionNote DocumentsCollectionNote { get; set; }
    }
}
