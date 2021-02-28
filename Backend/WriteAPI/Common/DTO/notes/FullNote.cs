using Common.DatabaseModels.models.NoteContent;
using Common.DTO.app;
using Common.DTO.labels;
using Common.DTO.notes.FullNoteContent;
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
        public NoteTypeDTO NoteType { set; get; }
        public RefTypeDTO RefType { set; get; }
        public List<BaseContentNoteDTO> Contents { set; get; }
    }
}
