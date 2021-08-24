using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.NoteContent.FileContent;

namespace Common.DatabaseModels.Models.Files.Contents
{
    [Table(nameof(PhotoNoteAppFile), Schema = SchemeConfig.File)]
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
