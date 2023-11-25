using System;
using System.Collections.Generic;
using Common.DTO.Notes.FullNoteContent.Files;

namespace Common.DTO.Notes.FullNoteContent
{
    public class AudiosCollectionNoteDTO : BaseNoteContentDTO
    {
        public string Name { set; get; }
        public List<AudioNoteDTO> Audios { set; get; }

        public AudiosCollectionNoteDTO(Guid id, int order, DateTimeOffset updatedAt, string name, List<AudioNoteDTO> audios, int version)
                : base(id, order, ContentTypeEnumDTO.Audios, updatedAt, version)
        {
            Name = name;
            Audios = audios;
        }
    }
}
