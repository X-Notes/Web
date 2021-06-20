using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage.models
{
    public class GetFileResponse
    {
        public byte[] File { set; get; }
        public string ContentType { set; get; }
    }
}
