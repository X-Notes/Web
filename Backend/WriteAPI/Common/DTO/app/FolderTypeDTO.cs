using Common.DatabaseModels.models.Folders;

namespace Common.DTO.app
{
    public class FolderTypeDTO
    {
        public FolderTypeENUM Id { set; get; }
        public string Name { set; get; }
        public FolderTypeDTO(FolderTypeENUM Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}
