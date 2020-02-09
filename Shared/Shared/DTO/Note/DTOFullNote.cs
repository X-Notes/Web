using Shared.DTO.Label;
using Shared.Mongo;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.Note
{
    public class DTOFullNote
    {
        public string Id { set; get; }
        public string Title { set; get; }
        public List<Part> Parts { set; get; }
        public List<LabelDTO> Labels { set; get; }
        public bool Locked { set; get; }
    }
}
