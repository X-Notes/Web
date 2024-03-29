﻿using System;
using System.Collections.Generic;


namespace Common.DTO.Notes.AdditionalContent
{
    public class BottomNoteContent
    {
        public Guid NoteId { set; get; }

        public bool IsHasUserOnNote { set; get; }

        public List<NoteFolderInfo> NoteFolderInfos { set; get; }

        public List<NoteRelatedNoteInfo> NoteRelatedNotes { set; get; }
    }
}
