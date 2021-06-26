using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.notes.FullNoteContent
{
    public class AudiosPlaylistNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public List<AudioNoteDTO> Audios { set; get; }

        public AudiosPlaylistNoteDTO(Guid Id, DateTimeOffset UpdatedAt, string name, List<AudioNoteDTO> audios)
                : base(Id, ContentTypeENUM.PlaylistAudios, UpdatedAt)
        {
            Name = name;
            Audios = audios;
        }
    }
}
