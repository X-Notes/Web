using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage.Models
{
    public class UploadFileResult
    {
        public string FilePath { get; set; }

        public long UploadedFileSize { set; get; }

        public long StorageFileSize { set; get; }

    }
}
