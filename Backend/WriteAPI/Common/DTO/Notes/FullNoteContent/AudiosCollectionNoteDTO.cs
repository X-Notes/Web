using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AudiosCollectionNoteDTO : BaseNoteContentDTO
    {
        public string Name { set; get; }
        public List<AudioNoteDTO> Audios { set; get; }

        public AudiosCollectionNoteDTO(Guid Id, int order, DateTimeOffset UpdatedAt, string name, List<AudioNoteDTO> audios)
                : base(Id, order, ContentTypeEnumDTO.Audios, UpdatedAt)
        {
            Name = name;
            Audios = audios;
        }
    }
}
