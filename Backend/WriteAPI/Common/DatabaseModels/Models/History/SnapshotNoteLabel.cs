using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.History
{
    [Table(nameof(SnapshotNoteLabel), Schema = SchemeConfig.NoteHistory)]
    public class SnapshotNoteLabel
    {
        public string Color { set; get; }

        public string Name { set; get; }
    }
}
