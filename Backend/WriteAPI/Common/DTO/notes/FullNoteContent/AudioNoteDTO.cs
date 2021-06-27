using System;


namespace Common.DTO.notes.FullNoteContent
{
    public class AudioNoteDTO
    {
        public Guid FileId { set; get; }
        public string Name { set; get; }
        public string AudioPath { set; get; }
        public AudioNoteDTO(string Name, Guid fileId, string AudioPath)
        {
            this.FileId = fileId;
            this.Name = Name;
            this.AudioPath = AudioPath;
        }
    }
}
