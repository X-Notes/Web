using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo.Parts
{
    public class ListCheckpoint : Part
    {
        public List<Dictionary<bool, string>> List { set;get; }
    }
}
