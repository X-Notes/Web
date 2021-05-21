
using Common.DatabaseModels.models;

namespace Common.DTO.notes
{
    public class FullNoteAnswer
    {
        public bool IsOwner { set; get; }
        public bool CanView { set; get; }
        public bool CanEdit { set; get; }
        public FullNote FullNote { set; get; }
    }
}
