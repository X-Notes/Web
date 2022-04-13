using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Labels;
using Common.Interfaces;

namespace Common.DTO.Notes
{
    public class FullNote : IDateCreator, IDateUpdater, IDateDeleter
    {
        public Guid Id { get; set; }

        public string Title { set; get; }

        public string Color { set; get; }

        public List<LabelDTO> Labels { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public NoteTypeENUM NoteTypeId { set; get; }

        public bool IsLocked { set; get; }

        public bool IsLockedNow { set; get; }

        public DateTimeOffset? UnlockedTime { set; get; }

        public DateTimeOffset? DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
