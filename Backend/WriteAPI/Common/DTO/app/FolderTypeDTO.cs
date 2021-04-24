using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.app
{
    public class FolderTypeDTO
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public FolderTypeDTO(Guid Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}
