using Common.DatabaseModels.helpers;
using Common.DTO.labels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.notes
{
    public class SmallNote
    {
        public string Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public List<LabelDTO> Labels { set; get; }
        public RefType RefType { set; get; }
    }
}
