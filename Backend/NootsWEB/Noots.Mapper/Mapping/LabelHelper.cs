using Common.DatabaseModels.Models.Labels;

namespace Mapper.Mapping
{
    public static class LabelHelper
    {
        public static List<LabelsNotes> GetLabelUnDesc(this List<LabelsNotes> labels)
        {
            return labels.OrderBy(x => x.AddedAt).ToList();
        }
    }
}
