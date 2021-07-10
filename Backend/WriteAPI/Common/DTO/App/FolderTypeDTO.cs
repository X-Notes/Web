using Common.DatabaseModels.Models.Folders;

namespace Common.DTO.App
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
