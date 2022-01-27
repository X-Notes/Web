using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;

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
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.AudiosCollection;
        }

        public AudiosCollectionNote(AudiosCollectionNote entity, List<AudioNoteAppFile> audios, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.AudiosCollection;

            AudioNoteAppFiles = audios;
        }

        public AudiosCollectionNote(AudiosCollectionNote entity, List<AppFile> audios, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.AudiosCollection;

            Audios = audios;
        }

        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return Audios.Select(x => x.Id);
        }
    }
}
