using Common.DatabaseModels.models.Files;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.models.NoteContent
{
    [Table("AudioNote")]
    public class AudioNote : BaseNoteContent
    {
        public string Name { set; get; }
        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public AudioNote()
        {
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Audio;
        }

        public AudioNote(AudioNote entity, AppFile audio, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Audio;

            Name = entity.Name;

            AppFile = audio;
        }

    }
}
