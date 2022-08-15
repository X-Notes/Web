using Common.DatabaseModels.Models.Files;
using System;
using System.ComponentModel.DataAnnotations.Schema;


namespace Common.DatabaseModels.Models.History
{
    [Table(nameof(SnapshotFileContent), Schema = SchemeConfig.NoteHistory)]
    public class SnapshotFileContent : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }

        public Guid NoteSnapshotId { get; set; }
        public NoteSnapshot NoteSnapshot { get; set; }

        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }
    }
}
