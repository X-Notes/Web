using Common.DatabaseModels.models.NoteContent;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.models.Files
{
    public class AlbumNoteAppFile : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public Guid AlbumNoteId { get; set; }
        public AlbumNote AlbumNote { get; set; }
    }
}
