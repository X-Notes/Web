using System.Collections.Generic;

namespace Common.DTO.Labels
{
    public class LabelsDTO
    {
        public List<LabelDTO> LabelsAll { set; get; }
        public List<LabelDTO> LabelsDeleted { set; get; }
    }
}
