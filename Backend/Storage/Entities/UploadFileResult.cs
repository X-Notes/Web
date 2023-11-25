

namespace Storage.Entities
{
    public class UploadFileResult
    {
        public string FileName { set; get; }

        public string FilePath { get; set; }

        public long UploadedFileSize { set; get; }

        public long StorageFileSize { set; get; }

    }
}
