using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DatabaseModels.Models.Files
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
