

using System.IO;

namespace Common.DTO.Files
{
    public class FilesBytes
    {
        public byte[] Bytes { set; get; }

        public string ContentType { set; get; }

        public string FileName { set; get; }

        public FilesBytes(byte[] Bytes, string Type, string FileName)
        {
            this.Bytes = Bytes;
            this.ContentType = Type;
            this.FileName = FileName;
        }
    }
}
