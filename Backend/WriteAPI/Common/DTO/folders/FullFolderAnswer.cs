
using Common.DatabaseModels.models;

namespace Common.DTO.folders
{
    public class FullFolderAnswer
    {
        public bool IsOwner { set; get; }
        public bool CanView { set; get; }
        public bool CanEdit { set; get; }
        public FullFolder FullFolder { set; get; }
    }
}
