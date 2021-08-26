using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.NoteContent.FileContent;

namespace Common.DatabaseModels.Models.Files.Contents
{
    [Table(nameof(AudioNoteAppFile), Schema = SchemeConfig.NoteContent)]
    public class AudioNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid AudiosCollectionNoteId { get; set; }
        public AudiosCollectionNote AudiosCollectionNote { get; set; }
    }
}
