using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.Note
{
    public class DTONote
    {
        public string Id { set; get; }
        public string Title { set; get; }
        public int Order { set; get; }
        public List<LabelSmall> Labels { set; get; }
        public bool Locked { set; get; }
    }
}
