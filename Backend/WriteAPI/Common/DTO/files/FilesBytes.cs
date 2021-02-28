using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.files
{
    public class FilesBytes
    {
        public byte[] Bytes { set; get; }
        public string Type { set; get; }
        public FilesBytes(byte[] Bytes, string Type)
        {
            this.Bytes = Bytes;
            this.Type = Type;
        }
    }
}
