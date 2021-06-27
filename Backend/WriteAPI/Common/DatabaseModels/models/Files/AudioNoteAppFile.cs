using Common.DatabaseModels.models.NoteContent;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.models.Files
{
    public class AudioNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid AudioNoteId { get; set; }
        public AudiosPlaylistNote AudioNote { get; set; }
    }
}
