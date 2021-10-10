

namespace WriteAPI.ConstraintsUploadFiles
{
    public class FileSizeConstraintsDTO
    {
        public long MaxProfilePhotoSize { set;  get; }

        public long MaxBackgroundPhotoSize { set;  get; }

        public FileSizeConstraintsDTO(long maxProfilePhotoSize, long maxBackgroundPhotoSize)
        {
            MaxProfilePhotoSize = maxProfilePhotoSize;
            MaxBackgroundPhotoSize = maxBackgroundPhotoSize;
        }
    }

    public static class FileSizeConstraints
    {
        public static long MaxRequestFileSize { get; } = 1572864000; // 1500 MB

        public static long MaxProfilePhotoSize { get; }  = 8388608; // 8 MB

        public static long MaxBackgroundPhotoSize { get; } = 41943040; // 40 MB
    }
}
