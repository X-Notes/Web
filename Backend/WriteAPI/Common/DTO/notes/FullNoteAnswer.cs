
using Common.DatabaseModels.models;

namespace Common.DTO.notes
{
    public class FullNoteAnswer
    {
        public bool CanView { set; get; }
        public bool CanEdit { set; get; }
        public FullNote FullNote { set; get; }
    }
}
