using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.labels
{
    public class LabelsDTO
    {
        public List<LabelDTO> LabelsAll { set; get; }
        public List<LabelDTO> LabelsDeleted { set; get; }
    }
}
