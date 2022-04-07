using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Labels;
using Common.DTO.Notes.FullNoteContent;
using Common.Interfaces;

namespace Common.DTO.Notes
{
    public class SmallNote : IDateCreator, IDateUpdater, IDateDeleter
    {
        public Guid Id { get; set; }

        public string Title { set; get; }

        public string Color { set; get; }

        public int Order { set; get; }

        public Guid UserId { set; get; }

        public List<LabelDTO> Labels { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public NoteTypeENUM NoteTypeId { set; get; }

        public List<BaseNoteContentDTO> Contents { set; get; }

        public bool IsLocked { set; get; }

        public bool IsLockedNow { set; get; }

        public bool IsCanEdit { set; get; }

        public DateTimeOffset? DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
