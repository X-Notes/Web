using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
{
    public class AlbumPhotoDTO
    {
        public Guid Id { set; get; }
        public AlbumPhotoDTO(Guid Id)
        {
            this.Id = Id;
        }
    }
}
