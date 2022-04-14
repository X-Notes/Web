

namespace Common.Timers
{
    public class TimersConfig
    {
        public int UnlockTimeMinutes { set; get; }

        public int DeleteLabelsNDays { set; get; }

        public int DeleteFoldersNDays { set; get; }

        public int DeleteNotesNDays { set; get; }

        public int DeleteHistoriesNDays { set; get; }

        public int MakeSnapshotAfterNMinutes { set; get; }
    }
}
