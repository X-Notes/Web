using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Contents;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(AudiosCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class AudiosCollectionNote : BaseNoteContent
    {
        public string Name { set; get; }

        public List<AppFile> Audios { set; get; }
        public List<AudioNoteAppFile> AudioNoteAppFiles { set; get; }

        public AudiosCollectionNote()
        {
            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.AudiosCollection;
        }

        public AudiosCollectionNote(AudiosCollectionNote entity, List<AudioNoteAppFile> audios, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.AudiosCollection;

            AudioNoteAppFiles = audios;
        }

        public AudiosCollectionNote(AudiosCollectionNote entity, List<AppFile> audios, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.AudiosCollection;

            Audios = audios;
        }

    }
}
