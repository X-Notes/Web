namespace Noots.History.Entities
{
    public class NoteHistoryDTOAnswer
    {
        public bool CanView { set; get; }

        public NoteSnapshotDTO NoteSnapshot { set; get; }

        public NoteHistoryDTOAnswer(bool canView, NoteSnapshotDTO noteSnapshot)
        {
            CanView = canView;
            NoteSnapshot = noteSnapshot;
        }
    }
}
