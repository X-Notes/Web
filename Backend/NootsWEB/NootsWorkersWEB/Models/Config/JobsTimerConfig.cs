namespace NootsWorkersWEB.Models.Config
{
    public class JobsTimerConfig
    {
        public int DeleteLabelsNDays { set; get; }

        public int DeleteFoldersNDays { set; get; }

        public int DeleteNotesNDays { set; get; }

        public int DeleteHistoriesNDays { set; get; }

        public int MakeSnapshotAfterNMinutes { set; get; }

        public int DeleteUnlinkedFilesAfterMinutes { set; get; }
    }
}
