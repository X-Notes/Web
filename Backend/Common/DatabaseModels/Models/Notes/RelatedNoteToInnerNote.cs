﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Notes
{
    [Table(nameof(RelatedNoteToInnerNote), Schema = SchemeConfig.Note)]
    public class RelatedNoteToInnerNote : BaseEntity<int>
    {
        public Guid NoteId { get; set; }
        public Note Note { get; set; }

        public Guid RelatedNoteId { get; set; }
        public Note RelatedNote { get; set; }

        public int Order { set; get; }

        public List<RelatedNoteUserState> RelatedNoteUserStates { set; get; }
    }
}
