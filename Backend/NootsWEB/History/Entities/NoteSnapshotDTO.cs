using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Labels;

namespace History.Entities
{
    public class NoteSnapshotDTO
    {
        public Guid Id { set; get; }

        public NoteTypeENUM NoteTypeId { set; get; }
        public RefTypeENUM RefTypeId { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }

        public List<LabelDTO> Labels { get; set; }

        public DateTimeOffset SnapshotTime { set; get; }

        public Guid NoteId { set; get; }
    }
}
