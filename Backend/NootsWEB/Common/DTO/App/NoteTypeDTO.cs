using Common.DatabaseModels.Models.Notes;

namespace Common.DTO.App
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

        public NoteTypeDTO()
        {

        }
    }
}
