using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
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
