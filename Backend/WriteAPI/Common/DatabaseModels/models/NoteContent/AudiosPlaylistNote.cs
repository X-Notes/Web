﻿using Common.DatabaseModels.models.Files;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.models.NoteContent
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

        public AudiosPlaylistNote(AudiosPlaylistNote entity, List<AppFile> audios, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.PlaylistAudios;

            Name = entity.Name;

            Audios = audios;
        }

    }
}
