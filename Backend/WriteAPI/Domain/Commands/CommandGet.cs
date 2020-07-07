using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class CommandGet
    {
        public string Type { set; get; }
        public object Data { set; get; }
    }
}
