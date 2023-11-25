using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Labels;
using Common.Interfaces;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes
{
    public class BaseNoteDTO : IDateCreator, IDateUpdater, IDateDeleter
    {
        public Guid Id { get; set; }

        public string Title { set; get; }

        public string Color { set; get; }

        public Guid UserId { set; get; }

        public bool IsCanEdit { set; get; }

        public List<LabelDTO> Labels { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public NoteTypeENUM NoteTypeId { set; get; }

        public DateTimeOffset? DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }

        public int Version { set; get; }
    }
}
