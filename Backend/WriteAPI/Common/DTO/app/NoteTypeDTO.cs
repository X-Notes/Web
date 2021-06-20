using Common.DatabaseModels.models.Notes;

namespace Common.DTO.app
{
    public class NoteTypeDTO
    {
        public NoteTypeENUM Id { set; get; }
        public string Name { set; get; }
        public NoteTypeDTO(NoteTypeENUM Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}
