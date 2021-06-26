using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
{
    public class AudioNoteDTO
    {
        public string Name { set; get; }
        public Guid FileId { set; get; }
        public string AudioPath { set; get; }
        public AudioNoteDTO(string Name, Guid fileId, string AudioPath)
        {
            this.FileId = fileId;
            this.Name = Name;
            this.AudioPath = AudioPath;
        }
    }
}
