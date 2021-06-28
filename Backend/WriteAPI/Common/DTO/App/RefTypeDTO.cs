using System;

namespace Common.DTO.App
{
    public class RefTypeDTO
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public RefTypeDTO(Guid Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}
