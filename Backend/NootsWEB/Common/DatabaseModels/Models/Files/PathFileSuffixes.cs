

namespace Common.DatabaseModels.Models.Files
{
    public class PathFileSuffixes
    {
        public string Small { set; get; }

        public string Medium { set; get; }

        public string Large { set; get; }

        public string Default { set; get; }

        public string GetFromSmallPath
        {
            get
            {
                return Small ?? Medium ?? Large ?? Default;
            }
        }

        public string GetFromDefaultPath
        {
            get
            {
                return Default ?? Large ?? Medium ?? Small;
            }
        }
    }
}
