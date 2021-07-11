using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table("AudioNote")]
    public class AudiosPlaylistNote : BaseNoteContent
    {
        public string Name { set; get; }

        public List<AppFile> Audios { set; get; }

        public List<AudioNoteAppFile> AudioNoteAppFiles { set; get; }

        public AudiosPlaylistNote()
        {
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.PlaylistAudios;
        }

        public AudiosPlaylistNote(AudiosPlaylistNote entity, List<AudioNoteAppFile> audios, Guid NoteId)
        {
            this.NoteId = NoteId;

            Order = entity.Order;
            Name = entity.Name;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.PlaylistAudios;

            AudioNoteAppFiles = audios;
        }

        public AudiosPlaylistNote(AudiosPlaylistNote entity, List<AppFile> audios, Guid NoteId)
        {
            this.NoteId = NoteId;

            Order = entity.Order;
            Name = entity.Name;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.PlaylistAudios;

            Audios = audios;
        }

    }
}
