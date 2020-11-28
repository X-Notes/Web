using Common.DatabaseModels.helpers;

namespace Common.DTO.folders
{
    public class SmallFolder
    {
        public string Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public RefType RefType { set; get; }
    }
}
