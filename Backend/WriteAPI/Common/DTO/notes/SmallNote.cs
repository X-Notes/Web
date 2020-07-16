using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.notes
{
    public class SmallNote
    {
        public string WriteId { get; set; }
        public string ReadId { set; get; }
        public string Title { set; get; }
        public int Order { set; get; }
    }
}
