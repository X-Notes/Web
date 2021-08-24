using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AudiosCollectionNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public List<AudioNoteDTO> Audios { set; get; }

        public AudiosCollectionNoteDTO(Guid Id, DateTimeOffset UpdatedAt, string name, List<AudioNoteDTO> audios)
                : base(Id, ContentTypeENUM.AudiosCollection, UpdatedAt)
        {
            Name = name;
            Audios = audios;
        }
    }
}
