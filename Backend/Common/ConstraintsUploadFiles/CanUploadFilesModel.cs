using System.Collections.Generic;

namespace Common.ConstraintsUploadFiles
{
    public class CanUploadFilesModel
    {
        public long Size { set; get; }

        public List<string> Types { set; get; }
    }
}
