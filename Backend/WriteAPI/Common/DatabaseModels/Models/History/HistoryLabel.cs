using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.History
{
    [Table(nameof(HistoryLabel), Schema = SchemeConfig.NoteHistory)]
    public class HistoryLabel
    {
        public string Color { set; get; }

        public string Name { set; get; }
    }
}
