using System;

namespace Common.DTO.History
{
    public class NoteHistoryDTOAnswer
    {
        public bool CanView { set; get; }

        public NoteSnapshotDTO NoteSnapshot { set; get; }

        public NoteHistoryDTOAnswer(bool canView, NoteSnapshotDTO noteSnapshot)
        {
            this.CanView = canView;
            this.NoteSnapshot = noteSnapshot;
        }
    }
}
