using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
{
    public class AudioNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public Guid FileId { set; get; }
        public string AudioPath { set; get; }
        public AudioNoteDTO(string Name, Guid fileId, string AudioPath, Guid Id, string Type, DateTimeOffset UpdatedAt)
            : base(Id, Type, UpdatedAt)
        {
            this.FileId = fileId;
            this.Name = Name;
            this.AudioPath = AudioPath;
        }
    }
}
