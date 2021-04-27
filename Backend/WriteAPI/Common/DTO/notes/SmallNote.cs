using Common.DTO.app;
using Common.DTO.labels;
using Common.DTO.notes.FullNoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.notes
{
    public class SmallNote
    {
        public Guid Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public List<LabelDTO> Labels { set; get; }
        public RefTypeDTO RefType { set; get; }
        public NoteTypeDTO NoteType { set; get; }
        public List<BaseContentNoteDTO> Contents { set; get; }
        public bool IsLocked { set; get; }

        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
