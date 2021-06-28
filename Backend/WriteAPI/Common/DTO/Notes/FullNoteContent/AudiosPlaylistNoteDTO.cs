using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
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
