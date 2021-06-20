using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Systems;
using Common.DTO.app;
using Common.DTO.labels;
using System;
using System.Collections.Generic;

namespace Common.DTO.notes
{
    public class FullNote
    {
        public Guid Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public List<LabelDTO> Labels { set; get; }
        public RefTypeENUM RefTypeId { set; get; }
        public NoteTypeENUM NoteTypeId { set; get; }
        public bool IsLocked { set; get; }

        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
