using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DatabaseModels.Models.Files
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
