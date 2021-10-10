using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(PhotoNoteAppFile), Schema = SchemeConfig.NoteContent)]
    public class PhotoNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid PhotosCollectionNoteId { get; set; }
        public PhotosCollectionNote PhotosCollectionNote { get; set; }
    }
}
