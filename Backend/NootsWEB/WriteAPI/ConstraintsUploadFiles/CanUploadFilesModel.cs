using System.Collections.Generic;

namespace WriteAPI.ConstraintsUploadFiles
{
    public class CanUploadFilesModel
    {
        public long Size { set; get; }

        public List<string> Types { set; get; }
    }
}
